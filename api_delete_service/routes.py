from flask import Blueprint, jsonify
from db_service.database import patients, doctors, appointments

delete_bp = Blueprint("delete_service", __name__)


@delete_bp.route("/api/ser-salud/patient/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    try:
        result = patients.find_one_and_delete({"id": patient_id})
        if not result:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify({"message": "Patient deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@delete_bp.route("/api/ser-salud/doctor/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    try:
        result = doctors.find_one_and_delete({"id": doctor_id})
        if not result:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify({"message": "Doctor deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@delete_bp.route("/api/ser-salud/appointment/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    try:
        result = appointments.find_one_and_delete({"id": appointment_id})
        if not result:
            return jsonify({"error": "Appointment not found"}), 404
        return jsonify({"message": "Appointment deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
