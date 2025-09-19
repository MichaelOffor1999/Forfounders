from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from utils.activity import touch_last_active

discovery_bp = Blueprint('discovery', __name__)

@discovery_bp.route('/waved/<target_user_id>', methods=['POST'])
@jwt_required()
def wave_user(target_user_id):
    mongo = current_app.mongo
    users = mongo.db.users
    data = request.json
    user_id = get_jwt_identity()
    touch_last_active(users, ObjectId(user_id))
    

    #ensure both user are valid
    current_user = users.find_one({'_id': ObjectId(user_id)})
    target_user = users.find_one({'_id': ObjectId(target_user_id)})

    if not current_user or not target_user:
        return jsonify({'msg': 'User not found'}), 404
    
    #ensure theres no duplucate waves
    if target_user_id in current_user.get('waved_users', []):
        return jsonify({'msg': 'You already waved at this user'}), 200
    
    try:
        users.update_one({'_id': ObjectId(user_id)}, {'$addToSet': {'waved_users': target_user_id}})
        target_user = users.find_one({'_id': ObjectId(target_user_id)})
        if user_id in target_user.get('waved_users', []):
            # Add both to connected_users
            users.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$addToSet': {'connected_users': target_user_id},
                    '$pull': {'waved_users': target_user_id}
                }
            )
            users.update_one(
                {'_id': ObjectId(target_user_id)},
                {
                    '$addToSet': {'connected_users': user_id},
                    '$pull': {'waved_users': user_id}
                }
            )

            return jsonify({'msg': 'It’s a match!', 'match': True}), 200

        return jsonify({'msg': 'Wave sent successfully', 'match': False}), 200
    except Exception as e:
        return jsonify({'msg': f'Something went wrong, {str(e)}'}), 500
    
@discovery_bp.route('/skip/<target_user_id>', methods=['POST'])
@jwt_required()
def skip_user(target_user_id):
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()
    touch_last_active(users, ObjectId(user_id))
    
    current_user = users.find_one({'_id': ObjectId(user_id)})
    target_user = users.find_one({'_id': ObjectId(target_user_id)})

    if not current_user or not target_user:
        return jsonify({'msg': 'User not found'}), 404
    
    if target_user_id in current_user.get('skipped_users', []):
        return jsonify({'msg': 'Already skipped user'}), 200
    
    try:
        users.update_one({'_id': ObjectId(user_id)}, {'$addToSet': {'skipped_users': target_user_id}})
        return jsonify({'msg': 'Skip was successful'}), 200
    except Exception as e:
        return jsonify({'msg': f'Something went wrong, {str(e)}'}), 500

# @discovery_bp.route('/connect/<target_user_id>', methods=['POST'])
# @jwt_required()
# def connect_users(target_user_id):
#     mongo = current_app.mongo
#     users = mongo.db.users
#     user_id = get_jwt_identity()
#     touch_last_active(users, ObjectId(user_id))

#     current_user = users.find_one({'_id': ObjectId(user_id)})
#     target_user = users.find_one({'_id': ObjectId(target_user_id)})

#     if not current_user or not target_user:
#         return jsonify({'msg': 'User not found'}), 404
    
#     if target_user_id in current_user.get('connected_users', []):
#         return jsonify({'msg': 'You already connected with this user'}), 200
    
#     try:
#         users.update_one({'_id': ObjectId(user_id)}, {'$addToSet': {'connected_users': target_user_id}})
#         users.update_one({'_id': ObjectId(target_user_id)}, {'$addToSet': {'connected_users': user_id}})
#         return jsonify({'msg': 'Connection was successfull'}), 200
#     except Exception as e:
#         return jsonify({'msg': f'Something went wrong, {str(e)}'}), 500


@discovery_bp.route('/discovery', methods=['GET'])
@jwt_required()
def discovery():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()
    touch_last_active(users, ObjectId(user_id))


    current_user = users.find_one({'_id': ObjectId(user_id)})

    if not current_user:
        return jsonify({"msg": "User not found"}), 404


    seen_id = set(current_user.get('waved_users', []) + current_user.get('skipped_users', []) + current_user.get('connected_users', []) + [user_id])

    objectIds = []

    for sid in seen_id:
        try:
            objectIds.append(ObjectId(sid))
        except Exception:
            pass


    #get a random user from the db thats not in seen_id

    pipeline = [
    {"$match": {"_id": {"$nin": objectIds}}},        # include everyone not "seen"
    {"$sort": {"profile_score": -1}},              # higher score first; missing fields sort last
    {"$limit": 50},                                 # take a top slice for performance/quality
    {"$sample": {"size": 1}},                      # then pick 1 at random from that slice
]


    try:
        result = list(users.aggregate(pipeline))
    except Exception as e:
        current_app.logger.error(f"Error in discovery pipeline: {str(e)}", exc_info=True)
        return jsonify({'msg': 'An error occurred while fetching discovery profiles', 'error': str(e)}), 500

    if not result:
        return jsonify({'msg': 'No more profiles to discover', "user": None}), 200
    
    user = result[0]

    user_data = {
        'id': str(user['_id']),
        'name': user.get('name', ''),
        'course': user.get('course', ''),
        'campus': user.get('campus', ''),
        'tags': user.get('tags', []),
        'bio': user.get('bio', ''),
        'current_work': user.get('current_work', []),
        'collab_interest': user.get('collab_interest', []),
        'profile_picture': user.get('profile_picture', '')
    }

    return jsonify({'user': user_data}), 200

@discovery_bp.route('/connections', methods=['GET'])
@jwt_required()
def connection():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()

    current_user = users.find_one({'_id': ObjectId(user_id)})

    if not current_user:
        return jsonify({'msg': 'No user found'}), 404
    
    conn_ids = current_user.get("connected_users") or []

    if not conn_ids:
        return jsonify({"msg": "No connection yet"}), 200




