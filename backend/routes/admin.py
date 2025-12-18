from flask import Blueprint, jsonify
from models.User import User
from middleware.auth import authenticate
from models.Appointment import Appointment
import datetime

admin_bp = Blueprint('admin_bp', __name__)
# ---------------------------------------------------------
# 1. Get System Stats 
# ---------------------------------------------------------
@admin_bp.route('/stats', methods=['GET'])
@authenticate
def get_admin_stats(current_user):
    # Security Check
    if getattr(current_user, 'role', 'user') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
        
    try:
        # 1. Total Users (Everyone registered)
        total_users = User.objects.count()
        
        # 2. Confirmed Sessions (Real "Active Sessions")
        # We count appointments that are confirmed (scheduled)
        active_sessions = Appointment.objects(status='confirmed').count()
        
        # 3. Pending Approvals (Psychologists waiting)
        pending_approvals = User.objects(role='psychologist', is_verified=False).count()
        
        # 4. Verified Psychologists (Active doctors)
        active_docs = User.objects(role='psychologist', is_verified=True).count()

        return jsonify({
            "total_users": total_users,
            "active_sessions": active_sessions,
            "pending_approvals": pending_approvals,
            "active_doctors": active_docs
        }), 200
        
    except Exception as e:
        print("Stats Error:", e)
        return jsonify({"error": "Failed to fetch stats"}), 500
# ---------------------------------------------------------
# 2. Get Pending Psychologists
# ---------------------------------------------------------
@admin_bp.route('/pending-approvals', methods=['GET'])
@authenticate
def get_pending_approvals(current_user):
    # Security Check: Only Admins allowed
    # We check the role attribute safely
    role = getattr(current_user, 'role', 'user')
    
    if role != 'admin':
        return jsonify({"error": "Unauthorized access. Admin only."}), 403
        
    # Fetch psychologists who are NOT verified yet
    pending_users = User.objects(role='psychologist', is_verified=False)
    
    return jsonify([{
        "id": str(u.id),
        "name": u.name,
        "email": u.email,
        "license_number": u.license_number if hasattr(u, 'license_number') else "N/A",
        "joined": u.join_date.isoformat() if hasattr(u, 'join_date') else ""
    } for u in pending_users]), 200

# ---------------------------------------------------------
# 3. Approve a Psychologist
# ---------------------------------------------------------
@admin_bp.route('/approve/<id>', methods=['PUT'])
@authenticate
def approve_user(current_user, id):
    # Security Check
    role = getattr(current_user, 'role', 'user')
    if role != 'admin':
        return jsonify({"error": "Unauthorized access. Admin only."}), 403
        
    try:
        user = User.objects.get(id=id)
        
        if user.role != 'psychologist':
             return jsonify({"error": "User is not a psychologist"}), 400
             
        user.is_verified = True
        user.save()
        
        return jsonify({"message": f"Dr. {user.name} has been successfully approved!"}), 200
    except Exception as e:
        print("Approval Error:", e)
        return jsonify({"error": "User not found or server error"}), 404
    
# =========================================================
#  USER MANAGEMENT 
# =========================================================

@admin_bp.route('/users', methods=['GET'])
@authenticate
def get_all_users(current_user):
    # 1. Check Admin Role
    if getattr(current_user, 'role', 'user') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
        
    # 2. Fetch all users sorted by newest
    users = User.objects().order_by('-join_date')
    
    # 3. Return clean list
    return jsonify([{
        "id": str(u.id),
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "is_verified": getattr(u, 'is_verified', True), # Default to true for normal users
        "join_date": u.join_date.isoformat() if hasattr(u, 'join_date') else datetime.datetime.utcnow().isoformat()
    } for u in users]), 200


@admin_bp.route('/users/<id>', methods=['DELETE'])
@authenticate
def delete_user(current_user, id):
    # 1. Check Admin Role
    if getattr(current_user, 'role', 'user') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
        
    try:
        user_to_delete = User.objects.get(id=id)
        
        # 2. Safety Check: Prevent Admin from deleting themselves
        if str(user_to_delete.id) == str(current_user.id):
            return jsonify({"error": "You cannot delete your own admin account."}), 400
            
        # 3. Delete
        user_to_delete.delete()
        return jsonify({"message": "User account deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": "User not found"}), 404