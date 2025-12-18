from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.User import User
from models.GroupChat import GroupChat
from models.Message import Message
from models.PrivateMessage import PrivateMessage
from mongoengine.errors import DoesNotExist, ValidationError
from bson import ObjectId
import traceback

buddy = Blueprint('buddy', __name__, url_prefix='/api')

# Add these imports at the top
from models.Notification import Notification
from datetime import datetime

# === NOTIFICATION SYSTEM ===

# Get all notifications for current user
@buddy.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        current_user_id = get_jwt_identity()
        notifications = Notification.objects(user=ObjectId(current_user_id)).order_by('-timestamp')
        
        result = []
        for notif in notifications:
            result.append({
                "id": str(notif.id),
                "type": notif.type,
                "title": notif.title,
                "message": notif.message,
                "related_id": notif.related_id,
                "read": notif.read,
                "timestamp": notif.timestamp.isoformat(),
                "metadata": notif.metadata or {}
            })
            
        return jsonify(result), 200
        
    except Exception as e:
        print("❌ Error in get_notifications:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Mark notification as read
@buddy.route('/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    try:
        current_user_id = get_jwt_identity()
        notification = Notification.objects(id=ObjectId(notification_id), user=ObjectId(current_user_id)).first()
        
        if not notification:
            return jsonify({"message": "Notification not found"}), 404
            
        notification.read = True
        notification.save()
        
        return jsonify({"message": "Notification marked as read"}), 200
        
    except Exception as e:
        print("❌ Error in mark_notification_read:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Mark all notifications as read
@buddy.route('/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    try:
        current_user_id = get_jwt_identity()
        Notification.objects(user=ObjectId(current_user_id), read=False).update(set__read=True)
        
        return jsonify({"message": "All notifications marked as read"}), 200
        
    except Exception as e:
        print("❌ Error in mark_all_notifications_read:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Get unread notification count
@buddy.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    try:
        current_user_id = get_jwt_identity()
        count = Notification.objects(user=ObjectId(current_user_id), read=False).count()
        
        return jsonify({"unread_count": count}), 200
        
    except Exception as e:
        print("❌ Error in get_unread_count:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
# === FRIEND SYSTEM ===

# Send friend request
@buddy.route('/friend-request/send/<user_id>', methods=['POST'])
@jwt_required()
def send_friend_request(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        if not ObjectId.is_valid(user_id):
            return jsonify({"message": "Invalid user ID"}), 400
            
        current_user = User.objects(id=ObjectId(current_user_id)).first()
        target_user = User.objects(id=ObjectId(user_id)).first()
        
        if not target_user:
            return jsonify({"message": "User not found"}), 404
            
        if target_user.id == current_user.id:
            return jsonify({"message": "Cannot send friend request to yourself"}), 400
            
        # Check if already friends
        if current_user.id in [friend.id for friend in target_user.friends]:
            return jsonify({"message": "Already friends"}), 400
            
        # Check if request already sent
        if target_user.id in [user.id for user in current_user.friend_requests_sent]:
            return jsonify({"message": "Friend request already sent"}), 400
            
        # Send request
        current_user.friend_requests_sent.append(target_user)
        target_user.friend_requests_received.append(current_user)
        
        current_user.save()
        target_user.save()
         # Create notification for the target user
        notification = Notification(
            user=target_user,
            type='friend_request',
            title='Friend Request',
            message=f'{current_user.name} sent you a friend request',
            related_id=str(current_user.id),
            metadata={
                'sender_id': str(current_user.id),
                'sender_name': current_user.name
            }
        )
        notification.save()
        
        return jsonify({"message": "Friend request sent successfully"}), 200
        
    except Exception as e:
        print("❌ Error in send_friend_request:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
@buddy.route('/friend-requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        if not current_user: return jsonify({"error": "User not found"}), 404

        requests = []
        for req_user in current_user.friend_requests_received:
            requests.append({
                "id": str(req_user.id),
                "name": req_user.name,
                "bio": req_user.bio or "No bio available",
                "avatar_seed": req_user.avatar_seed or req_user.name 
            })
        return jsonify(requests), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Accept friend request
@buddy.route('/friend-request/accept/<user_id>', methods=['POST'])
@jwt_required()
def accept_friend_request(user_id):
    try:
        curr_id = get_jwt_identity()
        me = User.objects(id=curr_id).first()
        requester = User.objects(id=user_id).first()

        if not me or not requester:
            return jsonify({"message": "User not found"}), 404

        # 1. Add to friends list (Avoid duplicates)
        if requester not in me.friends: me.friends.append(requester)
        if me not in requester.friends: requester.friends.append(me)

        # 2. Remove from request lists (ROBUST WAY: Filter by ID)
        # We recreate the list filtering out the ID we want to remove
        # This avoids "ValueError: x not in list" if object instances differ
        me.friend_requests_received = [u for u in me.friend_requests_received if str(u.id) != str(requester.id)]
        requester.friend_requests_sent = [u for u in requester.friend_requests_sent if str(u.id) != str(me.id)]

        me.save()
        requester.save()

        return jsonify({"message": "Friend added"}), 200
    except Exception as e:
        print("Error accepting request:", e)
        return jsonify({"error": str(e)}), 500

# Reject friend request
@buddy.route('/friend-request/reject/<user_id>', methods=['POST'])
@jwt_required()
def reject_friend_request(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        if not ObjectId.is_valid(user_id):
            return jsonify({"message": "Invalid user ID"}), 400
            
        current_user = User.objects(id=ObjectId(current_user_id)).first()
        requester = User.objects(id=ObjectId(user_id)).first()
        
        if not requester:
            return jsonify({"message": "User not found"}), 404
            
        # Remove from requests
        current_user.friend_requests_received = [user for user in current_user.friend_requests_received if user.id != requester.id]
        requester.friend_requests_sent = [user for user in requester.friend_requests_sent if user.id != current_user.id]
        
        current_user.save()
        requester.save()
        
        return jsonify({"message": "Friend request rejected"}), 200
        
    except Exception as e:
        print("❌ Error in reject_friend_request:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500


# Get friends list
@buddy.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=ObjectId(current_user_id)).first()
        
        friends = []
        for user in current_user.friends:
            friends.append({
                "id": str(user.id),
                "name": user.name,
                "age": user.age,
                "location": user.location,
                "bio": user.bio,
                "interests": user.interests,
                "status": user.status
            })
            
        return jsonify(friends), 200
        
    except Exception as e:
        print("❌ Error in get_friends:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# === PRIVATE MESSAGING ===
@buddy.route('/private-messages', methods=['POST'])
@jwt_required()
def send_private_message():
    try:
        data = request.get_json()
        sender_id = get_jwt_identity()
        receiver_id = data.get('receiver_id')
        text = (data.get('message') or '').strip()

        if not text or not receiver_id:
            return jsonify({"message": "Message text and receiver ID are required"}), 400

        if not ObjectId.is_valid(sender_id) or not ObjectId.is_valid(receiver_id):
            return jsonify({"message": "Invalid user ID format"}), 400

        sender = User.objects(id=ObjectId(sender_id)).first()
        receiver = User.objects(id=ObjectId(receiver_id)).first()

        if not sender or not receiver:
            return jsonify({"message": "User not found"}), 404

        # Check if they are friends
        if receiver.id not in [friend.id for friend in sender.friends]:
            return jsonify({"message": "You can only message friends"}), 403

        # Create the message
        msg = PrivateMessage(
            sender=sender,
            receiver=receiver,
            message=text
        )
        msg.save()

        # Create notification for the receiver
        notification = Notification(
            user=receiver,
            type='message',
            title='New Message',
            message=f'You have a new message from {sender.name}',
            related_id=str(msg.id),
            metadata={
                'sender_id': str(sender.id),
                'sender_name': sender.name,
                'message_preview': text[:50] + ('...' if len(text) > 50 else '')
            }
        )
        notification.save()

        return jsonify({'message': 'Message sent successfully'}), 201

    except Exception as e:
        print("❌ Error in send_private_message:")
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Get private messages between users
@buddy.route('/private-messages/<friend_id>', methods=['GET'])
@jwt_required()
def get_private_messages(friend_id):
    try:
        current_user_id = get_jwt_identity()
        
        if not ObjectId.is_valid(current_user_id) or not ObjectId.is_valid(friend_id):
            return jsonify({"message": "Invalid user ID format"}), 400

        # Get messages in both directions
        messages = PrivateMessage.objects(
            (PrivateMessage.sender == ObjectId(current_user_id)) & 
            (PrivateMessage.receiver == ObjectId(friend_id)) |
            (PrivateMessage.sender == ObjectId(friend_id)) & 
            (PrivateMessage.receiver == ObjectId(current_user_id))
        ).order_by('timestamp')
        
        result = []
        for msg in messages:
            result.append({
                "id": str(msg.id),
                "sender": str(msg.sender.id),
                "senderName": msg.sender.name,
                "receiver": str(msg.receiver.id),
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
                "isCurrentUser": str(msg.sender.id) == current_user_id
            })

        return jsonify(result), 200

    except Exception as e:
        print("❌ Error in get_private_messages:")
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
@buddy.route('/private-messages/<friend_id>/read', methods=['PUT'])
@jwt_required()
def mark_messages_as_read(friend_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Mark all messages from this friend as read
        PrivateMessage.objects(
            sender=ObjectId(friend_id),
            receiver=ObjectId(current_user_id),
            read=False
        ).update(set__read=True)
        
        return jsonify({"message": "Messages marked as read"}), 200
        
    except Exception as e:
        print("❌ Error in mark_messages_as_read:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# In routes/buddy.py
@buddy.route('/private-messages/unread-count', methods=['GET'])
@jwt_required()
def get_unread_message_count():
    try:
        current_user_id = get_jwt_identity()
        count = PrivateMessage.objects(receiver=ObjectId(current_user_id), read=False).count()
        
        return jsonify({"unread_message_count": count}), 200
        
    except Exception as e:
        print("❌ Error in get_unread_message_count:", e)
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
# === GROUP CHATS (existing but enhanced) ===

# Get all buddies (existing - keep this)
@buddy.route('/buddies', methods=['GET'])
@jwt_required()
def get_buddies():
    try:
        current_user_id = get_jwt_identity()
        # Filter: Exclude self AND ensure role is 'user' (Hide admins/psychologists)
        users = User.objects(id__ne=ObjectId(current_user_id), role='user')
        
        current_user = User.objects(id=current_user_id).first()
        
        # Pre-calculate ID sets for speed
        friend_ids = {f.id for f in current_user.friends}
        sent_ids = {f.id for f in current_user.friend_requests_sent}
        received_ids = {f.id for f in current_user.friend_requests_received}

        result = []
        for user in users:
            # Simple Match Score (Shared Interests)
            user_interests = set(user.interests or [])
            my_interests = set(current_user.interests or [])
            match_score = len(user_interests.intersection(my_interests))

            result.append({
                "id": str(user.id),
                "name": user.name,
                "age": user.age,
                "interests": user.interests or [],
                "bio": user.bio,
                "location": user.location,
                "status": user.status,
                "matchScore": match_score,
                "isFriend": user.id in friend_ids,
                "friendRequestSent": user.id in sent_ids,
                "friendRequestReceived": user.id in received_ids
            })
        
        # Sort by match score
        result.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify(result), 200

    except Exception as e:
        print("Error fetching buddies:", e)
        return jsonify({"error": str(e)}), 500


# Get all group chats (existing - keep this)
@buddy.route('/group-chats', methods=['GET'])
@jwt_required()
def get_groups():
    try:
        # 1. Fetch existing groups
        groups = GroupChat.objects()
        
        # 2. --- AUTO-SEEDING LOGIC ---
        # If the database is empty, create default circles immediately
        if len(groups) == 0:
            print("🌱 Seeding default support circles...")
            defaults = [
                {
                    "name": "Anxiety Support", 
                    "description": "A safe space to share coping strategies and finding calm.", 
                    "category": "Anxiety"
                },
                {
                    "name": "Academic Stress", 
                    "description": "For students feeling overwhelmed by exams and deadlines.", 
                    "category": "Academic"
                },
                {
                    "name": "Sleep Strugglers", 
                    "description": "Can't sleep? Join the late-night support circle.", 
                    "category": "Wellness"
                },
                {
                    "name": "Gratitude Gang", 
                    "description": "Sharing one good thing every day to boost positivity.", 
                    "category": "Positivity"
                }
            ]
            
            for d in defaults:
                new_group = GroupChat(
                    name=d["name"], 
                    description=d["description"], 
                    category=d["category"],
                    members=[],     # Start empty
                    is_active=True
                )
                new_group.save()
            
            # Re-fetch after creating
            groups = GroupChat.objects() 
        
        # 3. Format for Frontend
        result = []
        for group in groups:
            result.append({
                "id": str(group.id),
                "name": group.name,
                "description": group.description,
                "members": len(group.members),
                "category": group.category,
                "lastActivity": group.last_activity.isoformat() if group.last_activity else None,
                "isActive": group.is_active
            })
            
        return jsonify(result), 200

    except Exception as e:
        print("Error fetching groups:", e)
        return jsonify({"error": str(e)}), 500
# Send group message (existing - keep this)
@buddy.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        author_id = get_jwt_identity()
        group_id = data.get('group_chat_id')
        text = (data.get('message') or '').strip()

        if not text or not group_id:
            return jsonify({"message": "Message text and group ID are required"}), 400

        if not ObjectId.is_valid(author_id):
            return jsonify({"message": "Invalid user ID format"}), 400
        if not ObjectId.is_valid(group_id):
            return jsonify({"message": "Invalid group ID format"}), 400

        author = User.objects(id=ObjectId(author_id)).first()
        group = GroupChat.objects(id=ObjectId(group_id)).first()

        if not author:
            return jsonify({"message": "User not found"}), 404
        if not group:
            return jsonify({"message": "Group chat not found"}), 404

        msg = Message(
            author=author,
            message=text,
            group_chat=group
        )
        msg.save()
        print("✅ Saved message successfully")

        return jsonify({'message': 'Message sent successfully'}), 201

    except Exception as e:
        print("❌ Error in send_message:")
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# Get group messages (existing - keep this)
# FIX: Robust get_messages that handles deleted users
@buddy.route('/messages/<group_id>', methods=['GET'])
@jwt_required()
def get_messages(group_id):
    try:
        current_user_id = get_jwt_identity()
        
        if not ObjectId.is_valid(group_id):
            return jsonify({"message": "Invalid group ID format"}), 400

        # Fetch messages for the group
        messages = Message.objects(group_chat=ObjectId(group_id)).order_by('timestamp')
        result = []
        
        for msg in messages:
            try:
                # DEFAULT VALUES if author is missing
                author_name = "Deleted User"
                is_current_user = False
                
                # SAFE AUTHOR CHECK (The Fix)
                # We check if 'author' field exists AND if we can access its properties without crashing
                if msg.author:
                    try:
                        # Attempt to access a property to trigger the DB lookup
                        # If the user was deleted, this line will throw the DoesNotExist error
                        _ = msg.author.id 
                        
                        author_name = msg.author.name
                        is_current_user = (str(msg.author.id) == current_user_id)
                    except DoesNotExist:
                        # User was deleted from DB. Keep "Deleted User" default.
                        pass
                
                message_data = {
                    "id": str(msg.id),
                    "author": author_name,
                    "message": msg.message,
                    "timestamp": msg.timestamp.isoformat() if msg.timestamp else datetime.datetime.utcnow().isoformat(),
                    "isCurrentUser": is_current_user
                }
                result.append(message_data)
                
            except Exception as msg_error:
                # If a specific message is totally corrupted, skip it but log it
                print(f"⚠️ Skipping corrupted message: {msg_error}")
                continue

        return jsonify(result), 200

    except Exception as e:
        print("❌ Error in get_messages:", e)
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500