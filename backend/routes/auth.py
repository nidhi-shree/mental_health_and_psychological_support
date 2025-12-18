from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.User import User
from mongoengine.errors import NotUniqueError

auth_bp = Blueprint('auth_bp', __name__)

# --- REGISTER ---
@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    role = data.get('role', 'user') 
    license_number = data.get('license_number', '')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing fields'}), 400

    try:
        # 1. Determine Verification Status
        # Psychologists are NOT verified by default. Everyone else is.
        is_verified = True
        if role == 'psychologist':
            is_verified = False

        # 2. Create User
        user = User(
            name=name, 
            email=email, 
            role=role,
            license_number=license_number,
            is_verified=is_verified
        )
        user.set_password(password)
        user.save()

        # 3. Handle Response based on Role
        if role == 'psychologist':
            # DO NOT return a token. They must wait for admin approval.
            return jsonify({
                'message': 'Registration successful. Your account is pending verification by an Admin. You cannot log in yet.',
                'require_verification': True
            }), 201

        # Standard User/Admin gets a token immediately
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'token': access_token,
            'access_token': access_token,
            'user': {
                'id': str(user.id), 
                'name': user.name, 
                'email': user.email, 
                'role': user.role
            }
        }), 201

    except NotUniqueError:
        return jsonify({'error': 'Email already registered'}), 400
    except Exception as e:
        print("Register error:", e)
        return jsonify({'error': 'Server error'}), 500

# --- LOGIN ---
@auth_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.objects(email=email).first()
    
    # 1. Check Password
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # 2. Check Verification (Block unverified doctors)
    # If they are a psychologist AND is_verified is False -> Block them
    if user.role == 'psychologist' and user.is_verified is False:
        return jsonify({
            'error': 'Your account is pending approval. Please wait for an admin to verify your license.'
        }), 403

    # 3. Success - Generate Token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'token': access_token,
        'access_token': access_token,
        'user': {
            'id': str(user.id), 
            'name': user.name, 
            'email': user.email, 
            'role': user.role,
            'profileCompleted': user.profileCompleted
        }
    }), 200