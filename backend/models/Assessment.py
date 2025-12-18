# models/Assessment.py
from mongoengine import Document, StringField, IntField, DateField

class Assessment(Document):
    type = StringField(required=True)
    score = IntField(required=True)
    level = StringField()
    description = StringField()
    date = DateField(required=True)
