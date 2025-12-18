from flask import Blueprint, jsonify, request
from models.User import User
from mongoengine.errors import ValidationError, DoesNotExist
from werkzeug.security import generate_password_hash, check_password_hash
from middleware.auth import authenticate # Ensure you have this imported

profile_bp = Blueprint('profile_bp', __name__)

# ---------------------------------------------------------
# 1. GET PROFILE
# ---------------------------------------------------------
@profile_bp.route('/<user_id>', methods=['GET'])
@authenticate
def get_profile(current_user, user_id):
    try:
        # Allow users to see their own profile, or others (if public features added later)
        # For now, we fetch the requested user
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "license_number": user.license_number if hasattr(user, 'license_number') else "",
            
            # Profile Details
            "phone": user.phone,
            "location": user.location,
            "age": user.age,
            
            # Buddy Space / Social Fields
            "bio": user.bio,
            "avatar_seed": user.avatar_seed,
            "interests": user.interests,
            
            "profileCompleted": user.profileCompleted,
            "join_date": user.join_date.strftime("%Y-%m-%d") if user.join_date else None
        }), 200

    except ValidationError:
        return jsonify({"error": "Invalid user ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# 2. UPDATE PROFILE
# ---------------------------------------------------------
@profile_bp.route('/<user_id>', methods=['PUT'])
@authenticate
def update_profile(current_user, user_id):
    # Security: Ensure user is editing THEIR OWN profile
    if str(current_user.id) != user_id:
        return jsonify({"error": "Unauthorized action"}), 403

    try:
        data = request.get_json()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # --- THE FIX: Expanded Allowed Fields ---
        # We loop through these keys. If they exist in the request, we update the user.
        allowed_fields = [
            "phone", "location", "age", 
            "bio", "avatar_seed", "interests"
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        # Logic for Profile Completion
        # If basic contact info is present, mark as complete
        if user.phone and user.location:
            user.profileCompleted = True
            
        user.save()

        # Return the FULL updated user object so Frontend updates immediately
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "phone": user.phone,
                "location": user.location,
                "bio": user.bio,
                "avatar_seed": user.avatar_seed,
                "interests": user.interests,
                "profileCompleted": user.profileCompleted,
                "join_date": user.join_date.strftime("%Y-%m-%d") if user.join_date else None
            }
        }), 200
    
    except ValidationError:
        return jsonify({"error": "Invalid input data"}), 400
    except Exception as e:
        print("Profile Update Error:", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# 3. CHANGE PASSWORD
# ---------------------------------------------------------
@profile_bp.route('/change-password/<user_id>', methods=['PUT'])
@authenticate
def change_password(current_user, user_id):
    # Security: Only allow self-change
    if str(current_user.id) != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')

        if not current_password or not new_password:
            return jsonify({"error": "Both current and new passwords are required"}), 400

        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Verify old password
        if not check_password_hash(user.password, current_password):
            return jsonify({"error": "Current password is incorrect"}), 401

        # Set new password
        user.password = generate_password_hash(new_password)
        user.save()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500