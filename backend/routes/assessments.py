# routes/assessments.py
from flask import Blueprint, request, jsonify
from models.Assessment import Assessment
from datetime import datetime

assessments_bp = Blueprint('assessments_bp', __name__)

@assessments_bp.route('/', methods=['GET'])
def get_assessments():
    assessments = Assessment.objects().order_by('-date')
    return jsonify([{
        "type": a.type,
        "score": a.score,
        "level": a.level,
        "description": a.description,
        "date": str(a.date)
    } for a in assessments]), 200

@assessments_bp.route('/', methods=['POST'])
def save_assessment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    today = datetime.utcnow().date()

    assessment = Assessment(
        type=data.get("type"),
        score=data.get("score"),
        level=data.get("level"),
        description=data.get("description"),
        date=today
    )
    assessment.save()  # MongoEngine save

    return jsonify({
        "message": "Assessment saved successfully",
        "id": str(assessment.id),
        "date": str(today)
    }), 201
