from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime


messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    sender_id = get_jwt_identity()
    recipient_id = data.get('to')
    text = data.get('text')
    mongo = current_app.mongo
    if not recipient_id or not text:
        return jsonify({'msg': 'Recipient and text required'}), 400
    # Check if users are connected
    users = mongo.db.users
    sender = users.find_one({'_id': ObjectId(sender_id)})
    if not sender or recipient_id not in sender.get('connected_users', []):
        return jsonify({'msg': 'You can only message connected users.'}), 403
    message = {
        'from': ObjectId(sender_id),
        'to': ObjectId(recipient_id),
        'text': text,
        'timestamp': datetime.utcnow()
    }
    mongo.db.messages.insert_one(message)
    return jsonify({'msg': 'Message sent'}), 200

@messages_bp.route('/messages/<user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    current_user = get_jwt_identity()
    mongo = current_app.mongo
    # Only allow if users are connected
    users = mongo.db.users
    user_doc = users.find_one({'_id': ObjectId(current_user)})
    if not user_doc or user_id not in user_doc.get('connected_users', []):
        return jsonify({'msg': 'You can only view messages with connected users.'}), 403
    query = {
        '$or': [
            {'from': ObjectId(current_user), 'to': ObjectId(user_id)},
            {'from': ObjectId(user_id), 'to': ObjectId(current_user)}
        ]
    }
    messages = list(mongo.db.messages.find(query).sort('timestamp', 1))
    for m in messages:
        m['_id'] = str(m['_id'])
        m['from'] = str(m['from'])
        m['to'] = str(m['to'])
        m['timestamp'] = m['timestamp'].isoformat()
    return jsonify({'messages': messages}), 200
