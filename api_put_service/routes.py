from flask import Blueprint, request, jsonify
from db_service.database import patients, doctors, appointments
from db_service.models import serialize

put_bp = Blueprint("put_service", __name__)


@put_bp.route("/api/ser-salud/patient/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    try:
        data = request.get_json()
        data.pop("id", None)
        result = patients.find_one_and_update(
            {"id": patient_id},
            {"$set": data},
            return_document=True,
        )
        if not result:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify(serialize(result))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@put_bp.route("/api/ser-salud/doctor/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    try:
        data = request.get_json()
        data.pop("id", None)
        result = doctors.find_one_and_update(
            {"id": doctor_id},
            {"$set": data},
            return_document=True,
        )
        if not result:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify(serialize(result))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@put_bp.route("/api/ser-salud/appointment/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    try:
        data = request.get_json()
        data.pop("id", None)
        result = appointments.find_one_and_update(
            {"id": appointment_id},
            {"$set": data},
            return_document=True,
        )
        if not result:
            return jsonify({"error": "Appointment not found"}), 404
        return jsonify(serialize(result))
    except Exception as e:
        return jsonify({"error": str(e)}), 400
