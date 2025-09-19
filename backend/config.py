import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "devkey") #get rid of the fallback key
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    MONGO_URI = os.environ.get("MONGO_URI")

    