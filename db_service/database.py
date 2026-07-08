from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

patients = db["patients"]
doctors = db["doctors"]
appointments = db["appointments"]
therapies = db["therapies"]
