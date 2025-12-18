# models/Resource.py
from mongoengine import Document, StringField, ListField, DateTimeField

class Resource(Document):
    meta = {'collection': 'Resource'}
    title = StringField(required=True)
    description = StringField()
    category = StringField(required=True)
    type = StringField(required=True)  # articles, videos, audios, meditations, strategies
    tags = ListField(StringField())
    duration = StringField()      # for videos/audios/meditations
    read_time = StringField()     # for articles
    difficulty = StringField()    # for strategies
    url = StringField(required=True)        # youtube link, mp3, or article URL
    thumbnail = StringField()    # image URL
    created_at = DateTimeField()
