from flask import jsonify

def error_handler(error):
    return jsonify({'message': 'Internal Server Error'}), 500
