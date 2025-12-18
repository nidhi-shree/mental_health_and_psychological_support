# fix_users.py
from models.User import User
import mongoengine
from db import create_db
from flask import Flask
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
create_db(app)  # Initialize MongoEngine connection

# Fix all users
for u in User.objects():
    if not hasattr(u, 'age'):
        u.age = 0
    if not hasattr(u, 'status'):
        u.status = 'offline'
    if not hasattr(u, 'interests'):
        u.interests = []
    u.save()
    print(f"Updated user: {u.name}")
