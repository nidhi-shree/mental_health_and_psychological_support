from mongoengine import Document, StringField, ReferenceField, DateTimeField
from models.User import User
import datetime

class Appointment(Document):
    # --- LINKS TO USERS ---
    patient = ReferenceField(User)       # The user who requested it
    psychologist = ReferenceField(User)  # The doctor who accepted it (starts null)

    # --- DETAILS ---
    name = StringField(required=True)
    email = StringField(required=True)
    phone = StringField()
    appointment_type = StringField(required=True)
    preferred_date = StringField(required=True)
    preferred_time = StringField(required=True)
    notes = StringField()
    
    # --- STATUS ---
    # 'pending': Visible in the pool for all psychologists
    # 'confirmed': Taken by a psychologist, visible in their schedule
    # 'cancelled': Cancelled by user or doctor
    status = StringField(default='pending')
    
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'indexes': [
            'status',
            'psychologist',
            'patient',
            '-created_at'
        ]
    }