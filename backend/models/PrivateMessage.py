from mongoengine import Document, StringField, ReferenceField, DateTimeField, BooleanField
from datetime import datetime

class PrivateMessage(Document):
    sender = ReferenceField('User', required=True)
    receiver = ReferenceField('User', required=True)
    message = StringField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    read = BooleanField(default=False)
    
    meta = {'collection': 'private_messages', 'db_alias': 'default'}