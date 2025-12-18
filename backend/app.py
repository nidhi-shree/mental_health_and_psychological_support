from flask import Flask, jsonify, session, request
from flask_cors import CORS
from datetime import timedelta
import logging
import os
from dotenv import load_dotenv

# Import DB and Config
from db import create_db
from config import configure_mail
from middleware.error_handler import error_handler

# Import JWT & Chatbot
from flask_jwt_extended import JWTManager
from chatbot import EmbraceAI, chat_with_embrace_ai

# --- IMPORT BLUEPRINTS ---
from routes.auth import auth_bp
from routes.appointments import appointments_bp
from routes.resources import resources_bp
from routes.moods import moods_bp
from routes.assessments import assessments_bp
from routes.profile import profile_bp
from routes.admin import admin_bp  # Admin Route
from routes.buddy import buddy     # Buddy Route
from routes.documents import documents_bp

# Initialize Environment
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize App
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Initialize Database & Mail
create_db(app)
configure_mail(app)

# Initialize Chatbot
embrace = EmbraceAI()

# --- REGISTER BLUEPRINTS ---
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
app.register_blueprint(resources_bp, url_prefix='/api/resources')
app.register_blueprint(moods_bp, url_prefix='/api/moods')
app.register_blueprint(assessments_bp, url_prefix='/api/assessments')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(buddy) # Buddy blueprint usually handles its own prefix or socketio
app.register_blueprint(documents_bp, url_prefix='/api/documents')
# --- DATABASE CONNECTION CHECK ---
try:
    from models.User import User
    user_count = User.objects.count()
    print(f"✅ Database Connected! Active Users: {user_count}")
except Exception as e:
    print(f"⚠️ Database check warning: {str(e)}")


# ----------------- Chatbot Routes -----------------
@app.route('/api/chat/talk', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                'reply': "Please type a message so I can understand how you're feeling.",
                'error': 'Empty message'
            })

        response = chat_with_embrace_ai(message)

        return jsonify({
            'reply': response['reply'],
            'sentiment': response['sentiment'],
            'crisis_level': response['crisis_level'],
            'needs_followup': response.get('needs_followup', True),
            'immediate_action': response.get('immediate_action', False),
            'success': True
        })

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({
            'reply': "I'm having trouble responding right now. Please try again in a moment.",
            'error': str(e),
            'success': False
        })

@app.route('/api/chat/session/start', methods=['POST'])
def start_session():
    session.permanent = True
    session['chat_started'] = True
    session['message_count'] = 0
    return jsonify({'success': True, 'message': 'Session started'})

@app.route('/api/chat/session/end', methods=['POST'])
def end_session():
    session.clear()
    return jsonify({'success': True, 'message': 'Session ended'})

# ----------------- Health Check -----------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Sahara Backend', 'version': '1.0.0'})

# ----------------- Global Error Handlers -----------------
app.register_error_handler(Exception, error_handler)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ----------------- Run Server -----------------
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)