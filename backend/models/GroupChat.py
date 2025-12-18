#models/GroupChat.py
from mongoengine import Document, StringField, ListField, ReferenceField, DateTimeField, BooleanField
from datetime import datetime

class GroupChat(Document):
    name = StringField(required=True)
    description = StringField(required=True)
    members = ListField(ReferenceField('User'))
    category = StringField()
    last_activity = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)

    meta = {'collection': 'group_chats', 'db_alias': 'default'}
