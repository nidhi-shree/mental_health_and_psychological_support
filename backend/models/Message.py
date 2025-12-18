#models/Message.py
from mongoengine import Document, StringField, ReferenceField, DateTimeField
from datetime import datetime

class Message(Document):
    author = ReferenceField('User', required=True)
    message = StringField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    group_chat = ReferenceField('GroupChat', required=True)

    meta = {'collection': 'messages', 'db_alias': 'default'}
