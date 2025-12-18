#middleware\auth.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.User import User
def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            # 1. Verify token exists
            verify_jwt_in_request()
            
            # 2. Get the ID from the token
            user_id = get_jwt_identity()
            
            # 3. CRITICAL FIX: Fetch the actual User Object from DB
            user = User.objects(id=user_id).first()
            
            if not user:
                return jsonify({"error": "User not found"}), 401
                
            # 4. Pass the full USER OBJECT (with .role, .name, etc.) to the route
            return f(user, *args, **kwargs)
            
        except Exception as e:
            print(f"Auth Error: {str(e)}")
            return jsonify({"error": "Invalid token"}), 401
            
    return wrapper