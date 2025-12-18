from flask import Blueprint, request, jsonify
from middleware.auth import authenticate
from config import mail
from flask_mail import Message
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import datetime

documents_bp = Blueprint('documents_bp', __name__)

@documents_bp.route('/send-prescription', methods=['POST'])
@authenticate
def send_prescription(current_user):
    # Security: Only psychologists can send prescriptions
    if getattr(current_user, 'role', 'user') != 'psychologist':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    patient_email = data.get('patient_email')
    patient_name = data.get('patient_name', 'Patient')
    content = data.get('content')
    
    if not patient_email or not content:
        return jsonify({"error": "Missing email or content"}), 400

    try:
        # 1. Generate PDF in Memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Header
        c.setFont("Helvetica-Bold", 20)
        c.drawString(72, 750, "MindCare - Clinical Note")
        
        c.setFont("Helvetica-Bold", 10)
        c.drawString(72, 720, f"Provider: Dr. {current_user.name}")
        c.drawString(72, 705, f"Date: {datetime.date.today()}")
        c.drawString(72, 690, f"Patient: {patient_name}")
        
        c.setLineWidth(1)
        c.line(72, 675, 540, 675)
        
        # Body
        c.setFont("Helvetica", 12)
        text = c.beginText(72, 650)
        # Handle multiline text
        for line in content.split('\n'):
            text.textLine(line)
        c.drawText(text)
        
        # Footer
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(72, 50, "This document is confidential and intended solely for the patient.")
        
        c.save()
        buffer.seek(0)
        
        # 2. Send Email
        msg = Message(
            subject=f"New Document from Dr. {current_user.name}",
            sender='mindcare24365@gmail.com',
            recipients=[patient_email],
            body="Dr. " + current_user.name + " has sent you a new clinical document. Please find it attached."
        )
        msg.attach("MindCare_Prescription.pdf", "application/pdf", buffer.read())
        mail.send(msg)
        
        return jsonify({"message": "Prescription sent successfully!"}), 200

    except Exception as e:
        print("PDF Error:", e)
        return jsonify({"error": "Failed to send document"}), 500
