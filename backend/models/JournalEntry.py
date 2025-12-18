from mongoengine import Document, StringField, ListField, DateTimeField, DictField
import datetime

class JournalEntry(Document):
    user_id = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    dominant_emotion = StringField(required=True)
    timeline = ListField(DictField()) # Stores the graph points [{'time': 1.0, 'emotion': 'Happy'}]
    transcript = StringField() # Text from speech
    analysis_summary = StringField() # "You appeared calm..."
    
    meta = {
        'indexes': [
            {'fields': ['user_id', '-created_at']} # Index for fast sorting by date
        ]
    }