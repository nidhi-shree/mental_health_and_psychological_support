from flask import Blueprint, request, jsonify, send_file
from models.Mood import Mood
import datetime
from middleware.auth import authenticate
import io
import os
from utils.emotion_model import detector # Import the class we just created
import tempfile
from models.JournalEntry import JournalEntry
from dotenv import load_dotenv # Added import

# Load environment variables from .env file
load_dotenv()

moods_bp = Blueprint('moods_bp', __name__)

# --- HELPER: Generate Narrative Summary ---
def generate_narrative(timeline):
    if not timeline: return "No emotional data detected."
    
    # Split timeline into 3 parts: Beginning, Middle, End
    n = len(timeline)
    start_slice = timeline[:n//3] or timeline[:1]
    mid_slice = timeline[n//3 : 2*n//3] or timeline[0:1]
    end_slice = timeline[2*n//3:] or timeline[-1:]
    
    def get_dom(slice_data):
        if not slice_data: return "Neutral"
        emotions = [t['emotion'] for t in slice_data]
        return max(set(emotions), key=emotions.count)

    start_emo = get_dom(start_slice)
    mid_emo = get_dom(mid_slice)
    end_emo = get_dom(end_slice)

    if start_emo == mid_emo == end_emo:
        return f"You appeared consistently {start_emo} throughout your reflection."
    elif start_emo == end_emo:
        return f"You started {start_emo}, briefly shifted to {mid_emo}, but returned to {end_emo} by the end."
    else:
        return f"You appeared {start_emo} at the beginning, but showed signs of {mid_emo} around the middle, ending with {end_emo}. This may indicate an emotional shift while discussing specific topics."

# ----------------------------------------
# GET moods for logged-in user ONLY
# ----------------------------------------
@moods_bp.route('/', methods=['GET'])
@authenticate
def get_moods(current_user):

    moods = Mood.objects(user_id=str(current_user.id)).order_by('-date')

    return jsonify([
        {
            "date": str(m.date),
            "mood": m.mood,
            "activities": m.activities
        }
        for m in moods
    ]), 200


# ----------------------------------------
# LOG today's mood for this user
# ----------------------------------------
@moods_bp.route('/', methods=['POST'])
@authenticate
def log_mood(current_user):

    data = request.get_json()
    mood = data.get("mood")
    activities = data.get("activities", [])

    if not mood:
        return jsonify({"error": "Mood is required"}), 400

    today = datetime.date.today()

    existing = Mood.objects(user_id=str(current_user.id), date=today).first()

    if existing:
        existing.update(mood=mood, activities=activities)
        msg = "Mood updated successfully"
    else:
        Mood(
            user_id=str(current_user.id),
            mood=mood,
            activities=activities,
            date=today
        ).save()
        msg = "Mood logged successfully"

    return jsonify({
        "message": msg,
        "mood": mood,
        "activities": activities,
        "date": str(today)
    }), 201
@moods_bp.route('/ai-insights', methods=['GET'])
@authenticate
def ai_insights(current_user):
    """
    Returns an AI-generated summary about last 30 days of moods.
    If Gemini client is available via environment, tries to call it; otherwise returns a computed summary.
    """
    # collect last 30 days (or all) moods for user
    thirty_days_ago = datetime.date.today() - datetime.timedelta(days=30)
    moods = Mood.objects(user_id=str(current_user.id), date__gte=thirty_days_ago).order_by('date')

    payload_text = []
    values = []
    for m in moods:
        payload_text.append(f"{m.date.isoformat()}: mood={m.mood}; activities={','.join(m.activities or [])}")
        values.append(m.mood)

    summary_text = "No data available for the last 30 days."
    if moods:
        # Try to call Gemini (if configured)
        try:
            # Attempt import and client initialization if GEMINI_KEY present
            from google import genai
            GEMINI_KEY = os.getenv("GEMINI_API_KEY_1")
            client = genai.Client(api_key=GEMINI_KEY) if GEMINI_KEY else None

            prompt = f"""
You are an empathetic mental-health assistant. Analyze the user’s last 30 days of mood logs:

Each entry is:
(date → mood level 1–5 → activities)
{chr(10).join(payload_text)}

Please generate a rich, helpful analysis in **structured JSON** with these keys:

{
  "summary": "One paragraph emotional analysis.",
  "trend": "increasing | decreasing | stable | mixed",
  "patterns": "Patterns you see between activities and mood.",
  "possible_causes": "Possible life or emotional triggers based on data.",
  "suggestions": "Clear, positive, actionable advice (3–5 lines).",
  "warnings": "Gentle warnings ONLY if mood has been low consistently."
}

Be kind, supportive, and non-judgmental.
Keep the tone warm and human.
"""

            if client:
                response = client.models.generate_content(
                    model=os.getenv("MOOD_AI_MODEL", "gemini-2.5-flash"),
                    contents=prompt
                )
                # response.text may be available
                summary_text = response.text.strip() if getattr(response, "text", None) else str(response)
            else:
                raise Exception("genai client not configured")
        except Exception as e:
            # Fallback local summary
            avg = sum(values) / len(values)
            if avg >= 4:
                trend = "generally positive"
                suggestion = "Keep doing what you're doing. Maintain activities that boost mood."
            elif avg >= 3:
                trend = "stable"
                suggestion = "Try adding small exercise or social time to lift mood."
            else:
                trend = "lower than usual"
                suggestion = "Consider reaching out to support or booking a professional appointment."
            summary_text = {
                "summary": f"In the last {len(values)} recorded day(s) your average mood is {avg:.2f}.",
                "trend": trend,
                "suggestion": suggestion
            }

    return jsonify({"insights": summary_text}), 200

@moods_bp.route('/export-pdf', methods=['GET'])
@authenticate
def export_mood_pdf(current_user):
    """
    Returns a PDF report for the last 30 days for the logged-in user.
    """
    # collect moods
    thirty_days_ago = datetime.date.today() - datetime.timedelta(days=30)
    moods = Mood.objects(user_id=str(current_user.id), date__gte=thirty_days_ago).order_by('date')

    # generate PDF in-memory using reportlab
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
    except Exception as e:
        return jsonify({"error": "reportlab is required on server for PDF export"}), 500

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "MindCare — Mood Report (Last 30 days)")

    c.setFont("Helvetica", 10)
    c.drawString(72, height - 94, f"Generated: {datetime.datetime.now().isoformat()}")
    c.drawString(72, height - 110, f"User ID: {current_user}")

    # Table header
    y = height - 140
    c.setFont("Helvetica-Bold", 11)
    c.drawString(72, y, "Date")
    c.drawString(180, y, "Mood (1-5)")
    c.drawString(260, y, "Activities")
    c.line(72, y - 4, width - 72, y - 4)
    y -= 18

    c.setFont("Helvetica", 10)
    for m in moods:
        if y < 100:
            c.showPage()
            y = height - 72
        c.drawString(72, y, str(m.date))
        c.drawString(180, y, str(m.mood))
        activities_str = ", ".join(m.activities or [])
        c.drawString(260, y, activities_str[:80])
        y -= 16

    # Simple summary
    y -= 10
    if moods:
        values = [m.mood for m in moods]
        avg = sum(values) / len(values)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(72, y, f"Average mood (last {len(values)} days): {avg:.2f}")
    else:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(72, y, "No mood entries found in past 30 days.")

    c.save()
    buffer.seek(0)

    # send as attachment
    return send_file(
        buffer,
        as_attachment=True,
        download_name="mindcare_mood_report.pdf",
        mimetype="application/pdf"
    )

# ----------------------------------------
@moods_bp.route('/analyze-video', methods=['POST'])
@authenticate
def analyze_video(current_user):
    if 'video' not in request.files:
        return jsonify({"error": "No video uploaded"}), 400
    
    file = request.files['video']
    transcript_text = request.form.get('transcript', '') # Get text from frontend
    
    fd, temp_path = tempfile.mkstemp(suffix='.webm')
    os.close(fd) 
    
    try:
        file.save(temp_path)
        
        # 1. Process Video
        timeline = detector.process_video(temp_path)
        
        if not timeline:
            return jsonify({"error": "No face detected in video"}), 422
            
        emotions = [t['emotion'] for t in timeline]
        dominant = max(set(emotions), key=emotions.count)
        
        # Calculate avg confidence
        confidences = [t.get('confidence', 0) for t in timeline]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # 2. Generate Summary
        summary = generate_narrative(timeline)
        
        # 3. Save to DB with new fields
        entry = JournalEntry(
            user_id=str(current_user.id),
            dominant_emotion=dominant,
            timeline=timeline,
            transcript=transcript_text,       # <--- Saved
            analysis_summary=summary          # <--- Saved
        )
        entry.save()
        
        return jsonify({
            "id": str(entry.id),
            "timeline": timeline,
            "dominant_emotion": dominant,
            "avg_confidence": avg_confidence,
            "summary": summary,               # <--- Returned
            "transcript": transcript_text,    # <--- Returned
            "date": entry.created_at.isoformat(),
            "message": "Journal entry saved"
        }), 200
        
    except Exception as e:
        print("Video Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ----------------------------------------
# Journal History 
# ----------------------------------------
@moods_bp.route('/journal-history', methods=['GET'])
@authenticate
def get_journal_history(current_user):
    try:
        entries = JournalEntry.objects(user_id=str(current_user.id)).order_by('-created_at').limit(10)
        
        return jsonify([{
            "id": str(e.id),
            "date": e.created_at.isoformat(),
            "dominant_emotion": e.dominant_emotion,
            "timeline": e.timeline,
            "summary": e.analysis_summary if hasattr(e, 'analysis_summary') else "No summary available.",
            "transcript": e.transcript if hasattr(e, 'transcript') else ""
        } for e in entries]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ----------------------------------------

@moods_bp.route('/detect-emotion', methods=['POST'])
@authenticate
def detect_emotion_api(current_user):
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    
    try:
        result = detector.detect(file)
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"error": "No face detected"}), 422
    except Exception as e:
        return jsonify({"error": str(e)}), 500