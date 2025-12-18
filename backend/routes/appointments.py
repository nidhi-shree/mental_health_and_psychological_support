from flask import Blueprint, request, jsonify
from models.Appointment import Appointment
from middleware.auth import authenticate
from config import mail
from flask_mail import Message
import datetime

appointments_bp = Blueprint('appointments_bp', __name__)

# --- EMAIL TEMPLATES ---
BOOKING_TEMPLATE = """
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4A90E2;">Appointment Request Received 💙</h2>
        <p>Hi <strong>{name}</strong>,</p>
        <p>We have received your request! Our team of psychologists is reviewing it now.</p>
        <p>
            <strong>Type:</strong> {type}<br>
            <strong>Preferred Date:</strong> {date}<br>
            <strong>Preferred Time:</strong> {time}
        </p>
        <p style="margin-top: 20px;">
            You will receive another email as soon as a specialist accepts your request.
        </p>
        <p>Warm regards,<br><strong>MindCare Team</strong></p>
    </div>
</body>
</html>
"""

CONFIRMED_TEMPLATE = """
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; border-left: 5px solid #4CAF50;">
        <h2 style="color: #2E7D32;">Appointment Confirmed! ✅</h2>
        <p>Hi <strong>{name}</strong>,</p>
        <p>Great news! <strong>Dr. {doctor_name}</strong> has accepted your appointment.</p>
        <p>
            <strong>Date:</strong> {date}<br>
            <strong>Time:</strong> {time}
        </p>
        <p style="margin-top: 20px;">
            Please log in to your dashboard at the scheduled time to join the session.
        </p>
        <p>Warm regards,<br><strong>MindCare Team</strong></p>
    </div>
</body>
</html>
"""

CANCELLED_TEMPLATE = """
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; border-left: 5px solid #F44336;">
        <h2 style="color: #D32F2F;">Appointment Cancelled</h2>
        <p>Hi <strong>{name}</strong>,</p>
        <p>Your appointment scheduled for <strong>{date}</strong> at <strong>{time}</strong> has been cancelled.</p>
        <p>If this was a mistake, or if you're ready to re-book, we are here for you.</p>
        <p>Warm regards,<br><strong>MindCare Team</strong></p>
    </div>
</body>
</html>
"""

# ------------------------------------------
# 1. USER: BOOK APPOINTMENT
# ------------------------------------------
@appointments_bp.route('/', methods=['POST'])
@authenticate
def book_appointment(current_user):
    data = request.get_json()
    required = ["name", "email", "appointment_type", "preferred_date", "preferred_time"]
    
    if not data or not all(field in data for field in required):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        # For CREATING, we use the Object (current_user) for ReferenceField
        appointment = Appointment(
            patient=current_user,  
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            appointment_type=data['appointment_type'],
            preferred_date=data['preferred_date'],
            preferred_time=data['preferred_time'],
            notes=data.get('notes'),
            status='pending'
        )
        appointment.save()

        # Send Email
        try:
            msg = Message("Appointment Request Received 📅", sender='mindcare24365@gmail.com', recipients=[data['email']])
            msg.html = BOOKING_TEMPLATE.format(
                name=data['name'],
                type=data['appointment_type'],
                date=data['preferred_date'],
                time=data['preferred_time']
            )
            mail.send(msg)
        except Exception as e:
            print("Email error:", e)

        return jsonify({'message': 'Request sent successfully', 'id': str(appointment.id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------
# 2. PSYCHOLOGIST: VIEW POOL
# ------------------------------------------
@appointments_bp.route('/pool', methods=['GET'])
@authenticate
def get_pending_pool(current_user):
    # Safe Role Check
    role = getattr(current_user, 'role', 'user')
    if role not in ['psychologist', 'admin']:
        return jsonify({"error": "Unauthorized"}), 403

    appts = Appointment.objects(status='pending').order_by('created_at')
    
    return jsonify([{
        "id": str(a.id),
        "patient_name": a.name,
        "type": a.appointment_type,
        "date": a.preferred_date,
        "time": a.preferred_time,
        "notes": a.notes
    } for a in appts]), 200

# ------------------------------------------
# 3. PSYCHOLOGIST: ACCEPT REQUEST
# ------------------------------------------
@appointments_bp.route('/<id>/accept', methods=['PUT'])
@authenticate
def accept_appointment(current_user, id):
    if getattr(current_user, 'role', 'user') != 'psychologist':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        appt = Appointment.objects.get(id=id)
        if appt.status != 'pending':
            return jsonify({"error": "Taken by another doctor"}), 409

        # Assign Psychologist
        appt.psychologist = current_user
        appt.status = 'confirmed'
        appt.save()

        # Email Logic
        doc_name = getattr(current_user, 'name', 'Doctor')
        try:
            msg = Message("Appointment Confirmed! ✅", sender='mindcare24365@gmail.com', recipients=[appt.email])
            msg.html = CONFIRMED_TEMPLATE.format(
                name=appt.name,
                doctor_name=doc_name,
                date=appt.preferred_date,
                time=appt.preferred_time
            )
            mail.send(msg)
        except Exception as e:
            print("Email error:", e)

        return jsonify({"message": "Confirmed", "doctor": doc_name}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------
# 4. PSYCHOLOGIST: MY SCHEDULE
# ------------------------------------------
@appointments_bp.route('/my-schedule', methods=['GET'])
@authenticate
def get_my_schedule(current_user):
    if getattr(current_user, 'role', 'user') != 'psychologist':
        return jsonify({"error": "Unauthorized"}), 403

    # Query by Psychologist Object
    appts = Appointment.objects(psychologist=current_user, status='confirmed').order_by('preferred_date')

    return jsonify([{
        "id": str(a.id),
        "patient_name": a.name,
        "type": a.appointment_type,
        "date": a.preferred_date,
        "time": a.preferred_time,
        "contact": a.email,
        "status": a.status
    } for a in appts]), 200

# ------------------------------------------
# 5. USER: MY APPOINTMENTS (FIXED)
# ------------------------------------------
@appointments_bp.route('/my-appointments', methods=['GET'])
@authenticate
def get_user_appointments(current_user):
    try:
        # Use current_user object directly for ReferenceField query
        appts = Appointment.objects(patient=current_user).order_by('-created_at')

        result = []
        for a in appts:
            doc_name = "Pending Assignment"
            if a.psychologist:
                doc_name = getattr(a.psychologist, 'name', 'Doctor')

            result.append({
                "id": str(a.id),
                "name": a.name,
                "email": a.email,
                "phone": a.phone,
                "appointment_type": a.appointment_type,
                "preferred_date": a.preferred_date,
                "preferred_time": a.preferred_time,
                "notes": a.notes,
                "status": a.status,
                "doctor": doc_name
            })

        return jsonify(result), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500

# ------------------------------------------
# 6. CANCEL (String ID Comparison Fix)
# ------------------------------------------
@appointments_bp.route('/cancel/<id>', methods=['PUT'])
@authenticate
def cancel_appointment(current_user, id):
    try:
        appt = Appointment.objects.get(id=id)
        
        # --- SAFE STRING COMPARISON ---
        curr_id = str(current_user.id)
        pat_id = str(appt.patient.id) if appt.patient else ""
        doc_id = str(appt.psychologist.id) if appt.psychologist else ""
        role = getattr(current_user, 'role', 'user')

        # Verify ownership or admin
        is_owner = pat_id == curr_id
        is_doc = doc_id == curr_id
        is_admin = role == 'admin'

        if not (is_owner or is_doc or is_admin):
             return jsonify({"error": "Unauthorized"}), 403

        appt.status = "cancelled"
        appt.save()
        
        # Email Logic
        try:
            msg = Message('Appointment Cancelled ❌', sender='mindcare24365@gmail.com', recipients=[appt.email])
            msg.html = CANCELLED_TEMPLATE.format(
                name=appt.name,
                date=appt.preferred_date,
                time=appt.preferred_time
            )
            mail.send(msg)
        except Exception as e:
            print("Email error:", e)

        return jsonify({"message": "Appointment cancelled"}), 200
    except Exception as e:
        return jsonify({"error": "Not found or server error"}), 404