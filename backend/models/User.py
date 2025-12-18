from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, ListField, IntField, ReferenceField
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(Document):
    name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
     
    avatar_seed = StringField(default="defaults") 
    # Options: 'user', 'psychologist', 'admin'
    role = StringField(default='user', required=True)
    license_number = StringField() # Only for psychologists
    is_verified = BooleanField(default=False) # True for users/admins, False for Psychologists initially
    age = IntField(default=0) 
    phone = StringField()
    location = StringField()
    profileCompleted = BooleanField(default=False)
    join_date = DateTimeField(default=datetime.datetime.utcnow)
    interests = ListField(StringField()) 
    bio = StringField()
    status = StringField(default='offline')
    
    # Friend system
    friends = ListField(ReferenceField('self'))  # List of accepted friends
    friend_requests_sent = ListField(ReferenceField('self'))  # Requests I sent
    friend_requests_received = ListField(ReferenceField('self'))  # Requests I received

    meta = {'collection': 'user', 'db_alias': 'default'}

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)