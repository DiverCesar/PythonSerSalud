from flask import Blueprint, request, jsonify
from datetime import datetime
from db_service.database import patients, doctors, appointments, therapies
from db_service.models import serialize

post_bp = Blueprint("post_service", __name__)


@post_bp.route("/api/ser-salud/patient", methods=["POST"])
def create_patient():
    try:
        data = request.get_json()
        last = patients.find_one({"id": {"$exists": True}}, sort=[("id", -1)])
        data["id"] = (last["id"] + 1) if last and "id" in last else 1
        data.setdefault("isActive", True)
        result = patients.insert_one(data)
        created = patients.find_one({"_id": result.inserted_id})
        return jsonify(serialize(created)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@post_bp.route("/api/ser-salud/doctor", methods=["POST"])
def create_doctor():
    try:
        data = request.get_json()
        last = doctors.find_one({"id": {"$exists": True}}, sort=[("id", -1)])
        data["id"] = (last["id"] + 1) if last and "id" in last else 1
        data.setdefault("isActive", True)
        result = doctors.insert_one(data)
        created = doctors.find_one({"_id": result.inserted_id})
        return jsonify(serialize(created)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@post_bp.route("/api/ser-salud/appointment", methods=["POST"])
def create_appointment():
    try:
        data = request.get_json()
        last = appointments.find_one({"id": {"$exists": True}}, sort=[("id", -1)])
        data["id"] = (last["id"] + 1) if last and "id" in last else 1
        data.setdefault("status", "pending")
        data.setdefault("createdAt", datetime.now().isoformat())
        data.setdefault("isActive", True)
        result = appointments.insert_one(data)
        created = appointments.find_one({"_id": result.inserted_id})
        return jsonify(serialize(created)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@post_bp.route("/api/ser-salud/seed", methods=["POST"])
def seed_database():
    try:
        if patients.count_documents({}) == 0:
            sample_patients = [
                {"fullName": "Carlos Rivera", "email": "carlos.rivera@email.com", "phone": "555-0101", "age": 45, "diagnosis": "Lumbar pain", "insuranceType": "Private", "registrationDate": "15/01/2026", "isActive": True},
                {"fullName": "Maria Torres", "email": "maria.torres@email.com", "phone": "555-0102", "age": 38, "diagnosis": "Ankle sprain", "insuranceType": "Public", "registrationDate": "22/02/2026", "isActive": True},
                {"fullName": "Juan Perez", "email": "juan.perez@email.com", "phone": "555-0103", "age": 52, "diagnosis": "Cervical pain", "insuranceType": "Private", "registrationDate": "10/03/2026", "isActive": True},
                {"fullName": "Ana Gomez", "email": "ana.gomez@email.com", "phone": "555-0104", "age": 29, "diagnosis": "Sports rehab", "insuranceType": "Public", "registrationDate": "05/04/2026", "isActive": False},
                {"fullName": "Luis Fernandez", "email": "luis.fernandez@email.com", "phone": "555-0105", "age": 61, "diagnosis": "Knee osteoarthritis", "insuranceType": "Private", "registrationDate": "18/05/2026", "isActive": True},
            ]
            for i, p in enumerate(sample_patients):
                p["id"] = i + 1
            patients.insert_many(sample_patients)

        if doctors.count_documents({}) == 0:
            sample_doctors = [
                {"id": 1, "fullName": "Dr. Ricardo Mendoza", "specialty": "Traumatology", "licenseNumber": "LIC-001", "rating": 4.8, "email": "ricardo.mendoza@clinica.com", "phone": "555-1001", "isActive": True},
                {"id": 2, "fullName": "Dra. Patricia Vega", "specialty": "Physical Therapy", "licenseNumber": "LIC-002", "rating": 4.9, "email": "patricia.vega@clinica.com", "phone": "555-1002", "isActive": True},
                {"id": 3, "fullName": "Dr. Andres Rios", "specialty": "Sports Medicine", "licenseNumber": "LIC-003", "rating": 4.6, "email": "andres.rios@clinica.com", "phone": "555-1003", "isActive": False},
            ]
            doctors.insert_many(sample_doctors)

        if therapies.count_documents({}) == 0:
            sample_therapies = [
                {"id": 1, "name": "Manual Therapy", "description": "Hands-on techniques for pain relief", "specialty": "Physical Therapy", "duration": 45, "price": 50.0},
                {"id": 2, "name": "Electrotherapy", "description": "Electrical stimulation for muscle recovery", "specialty": "Physical Therapy", "duration": 30, "price": 40.0},
                {"id": 3, "name": "Therapeutic Ultrasound", "description": "Deep tissue heating and healing", "specialty": "Traumatology", "duration": 20, "price": 35.0},
                {"id": 4, "name": "Sports Rehabilitation", "description": "Recovery program for athletes", "specialty": "Sports Medicine", "duration": 60, "price": 70.0},
            ]
            therapies.insert_many(sample_therapies)

        if appointments.count_documents({}) == 0:
            sample_appointments = [
                {"id": 1, "patientId": 1, "doctorId": 1, "therapyId": 1, "date": "10/07/2026", "time": "09:00", "status": "confirmed", "symptoms": "Lower back pain after lifting", "hasExams": True, "exams": "X-Ray lumbar spine", "notes": "First session", "createdAt": "2026-07-01T10:00:00", "isActive": True},
                {"id": 2, "patientId": 2, "doctorId": 2, "therapyId": 2, "date": "11/07/2026", "time": "10:30", "status": "pending", "symptoms": "Ankle swelling after sprain", "hasExams": False, "exams": "", "notes": "", "createdAt": "2026-07-02T14:00:00", "isActive": True},
                {"id": 3, "patientId": 3, "doctorId": 1, "therapyId": 3, "date": "12/07/2026", "time": "11:00", "status": "completed", "symptoms": "Neck stiffness and headaches", "hasExams": True, "exams": "MRI cervical spine", "notes": "Patient showing improvement", "createdAt": "2026-06-28T09:00:00", "isActive": True},
            ]
            appointments.insert_many(sample_appointments)

        return jsonify({"message": "Database seeded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
