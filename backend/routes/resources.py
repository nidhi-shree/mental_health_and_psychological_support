# routes/resources.py
from flask import Blueprint, request, jsonify
from models.Resource import Resource
from mongoengine.errors import ValidationError, NotUniqueError
import datetime

resources_bp = Blueprint('resources_bp', __name__)

# ------------------ GET ALL RESOURCES ------------------
@resources_bp.route('/', methods=['GET'])
def get_resources():
    """
    Optionally filter by type (articles, videos, audios, meditations, strategies)
    """
    resource_type = request.args.get('type')
    query = Resource.objects
    if resource_type:
        query = query(type=resource_type)
    
    result = []
    for r in query:
        result.append({
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "type": r.type,
            "tags": r.tags,
            "duration": r.duration,
            "read_time": r.read_time,
            "difficulty": r.difficulty,
            "url": r.url,
            "thumbnail": r.thumbnail,
        })
    return jsonify(result), 200

# ------------------ GET SINGLE RESOURCE ------------------
@resources_bp.route('/<resource_id>', methods=['GET'])
def get_resource(resource_id):
    resource = Resource.objects(id=resource_id).first()
    if not resource:
        return jsonify({"error": "Resource not found"}), 404
    
    return jsonify({
        "id": str(resource.id),
        "title": resource.title,
        "description": resource.description,
        "category": resource.category,
        "type": resource.type,
        "tags": resource.tags,
        "duration": resource.duration,
        "read_time": resource.read_time,
        "difficulty": resource.difficulty,
        "url": resource.url,
        "thumbnail": resource.thumbnail,
    }), 200

# ------------------ CREATE RESOURCE ------------------
@resources_bp.route('/', methods=['POST'])
def create_resource():
    data = request.get_json()
    required_fields = ['title', 'category', 'type', 'url']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        resource = Resource(
            title=data['title'],
            description=data.get('description'),
            category=data['category'],
            type=data['type'],
            tags=data.get('tags', []),
            duration=data.get('duration'),
            read_time=data.get('read_time'),
            difficulty=data.get('difficulty'),
            url=data['url'],
            thumbnail=data.get('thumbnail'),
            created_at=datetime.datetime.utcnow()
        )
        resource.save()
        return jsonify({"message": "Resource created", "id": str(resource.id)}), 201
    except NotUniqueError:
        return jsonify({"error": "Resource already exists"}), 400
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

# ------------------ DELETE RESOURCE ------------------
@resources_bp.route('/<resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    resource = Resource.objects(id=resource_id).first()
    if not resource:
        return jsonify({"error": "Resource not found"}), 404
    resource.delete()
    return jsonify({"message": "Resource deleted"}), 200

# ------------------ UPDATE RESOURCE ------------------
@resources_bp.route('/<resource_id>', methods=['PUT'])
def update_resource(resource_id):
    data = request.get_json()
    resource = Resource.objects(id=resource_id).first()
    if not resource:
        return jsonify({"error": "Resource not found"}), 404

    for field in ['title', 'description', 'category', 'type', 'tags', 'duration', 'read_time', 'difficulty', 'url', 'thumbnail']:
        if field in data:
            setattr(resource, field, data[field])
    
    resource.save()
    return jsonify({"message": "Resource updated"}), 200
