from flask import Blueprint, jsonify
from datetime import date, timedelta
from db_service.database import patients, doctors, appointments
from db_service.models import serialize

get_bp = Blueprint("get_service", __name__)


def calculate_time_elapsed(date_str):
    if not date_str:
        return {"years": 0, "months": 0, "days": 0}
    try:
        day, month, year = date_str.split("/")
        item_date = date(int(year), int(month), int(day))
        today = date.today()

        years = today.year - item_date.year
        months = today.month - item_date.month
        days = today.day - item_date.day

        if days < 0:
            months -= 1
            prev_month = today.month - 1 if today.month > 1 else 12
            prev_year = today.year if today.month > 1 else today.year - 1
            days += (date(prev_year, prev_month, 1) - timedelta(days=1)).day

        if months < 0:
            years -= 1
            months += 12

        return {"years": years, "months": months, "days": days}
    except Exception:
        return {"years": 0, "months": 0, "days": 0}


def parse_and_sort(data):
    for item in data:
        try:
            day, month, year = item["registrationDate"].split("/")
            item["_parsedDate"] = date(int(year), int(month), int(day))
        except Exception:
            item["_parsedDate"] = date.min
    return sorted(data, key=lambda x: x["_parsedDate"], reverse=True)


@get_bp.route("/api/ser-salud/patients")
def get_all_patients():
    data = list(patients.find())
    return jsonify([serialize(d) for d in data])


@get_bp.route("/api/ser-salud/patients/ordered")
def get_ordered_patients():
    data = list(patients.find())
    sorted_data = parse_and_sort(data)
    result = []
    for item in sorted_data:
        elapsed = calculate_time_elapsed(item.get("registrationDate", ""))
        del item["_parsedDate"]
        item["registeredAgo"] = elapsed
        result.append(serialize(item))
    return jsonify(result)


@get_bp.route("/api/ser-salud/patients/categories")
def get_patients_categories():
    data = list(patients.find())
    sorted_data = parse_and_sort(data)
    result = {"active": [], "inactive": []}
    for item in sorted_data:
        del item["_parsedDate"]
        key = "active" if item.get("isActive", True) else "inactive"
        result[key].append(serialize(item))
    return jsonify(result)


@get_bp.route("/api/ser-salud/patients/category/<status>")
def get_patients_by_category(status):
    if status not in ("valid", "invalid"):
        return jsonify({"error": "Status must be 'valid' or 'invalid'"}), 400
    is_active = status == "valid"
    data = list(patients.find({"isActive": is_active}))
    return jsonify([serialize(d) for d in data])


@get_bp.route("/api/ser-salud/doctors")
def get_all_doctors():
    data = list(doctors.find())
    return jsonify([serialize(d) for d in data])


@get_bp.route("/api/ser-salud/appointments")
def get_all_appointments():
    data = list(appointments.find())
    return jsonify([serialize(d) for d in data])
