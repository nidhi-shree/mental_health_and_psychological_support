import os
from mongoengine import connect

from dotenv import load_dotenv

def create_db(app):
    load_dotenv()  # loads from .env file
    mongo_uri = os.getenv("MONGODB_URI")
    connect(host=mongo_uri, alias="default")
