from mongoengine import Document, IntField, ListField, DateField, StringField

class Mood(Document):
    user_id = StringField(required=True)
    mood = IntField(required=True, min_value=1, max_value=5)
    activities = ListField()
    date = DateField(required=True)

    meta = {
        'indexes': [
            {'fields': ['user_id', 'date'], 'unique': True}
        ]
    }
