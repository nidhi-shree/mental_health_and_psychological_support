from mongoengine import Document, ReferenceField, StringField, DateTimeField, BooleanField, DictField
from datetime import datetime

class Notification(Document):
    user = ReferenceField('User', required=True)
    type = StringField(required=True, choices=['message', 'friend_request', 'system'])
    title = StringField(required=True)
    message = StringField(required=True)
    related_id = StringField()  # ID of related message, friend request, etc.
    read = BooleanField(default=False)
    timestamp = DateTimeField(default=datetime.utcnow)
    metadata = DictField()  # Additional data like sender info
    
    meta = {'collection': 'notifications', 'db_alias': 'default'}