import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "clinic_management")
APP_NAME = os.getenv("APP_NAME", "ser-salud")
PORT = int(os.getenv("PORT", 5000))
