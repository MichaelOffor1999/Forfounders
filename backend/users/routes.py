from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from bson.objectid import ObjectId
from datetime import timedelta
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profiles', methods=['POST'])
@jwt_required()
def get_profiles():
    mongo = current_app.mongo
    users = mongo.db.users
    ids = request.json.get('ids', [])
    if not isinstance(ids, list) or not ids:
        return jsonify({'msg': 'No user IDs provided'}), 400
    object_ids = []
    for uid in ids:
        try:
            object_ids.append(ObjectId(uid))
        except Exception:
            pass
    profiles = list(users.find({'_id': {'$in': object_ids}}))
    result = []
    for user in profiles:
        result.append({
            'id': str(user['_id']),
            'name': user.get('name', ''),
            'profile_picture': user.get('profile_picture', ''),
            'specialization': user.get('specialization', ''),
            'campus': user.get('campus', ''),
            'course': user.get('course', ''),
        })
    return jsonify({'profiles': result}), 200

@users_bp.route('/me', methods=['GET'])
@jwt_required() #figure out how this workes in the frontend
def get_profile():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()

    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'msg': 'User not found'}), 404

    # Calculate profile completeness
    profile_completed = all([
        user.get('name'),
        user.get('bio'),
        user.get('tags') and isinstance(user.get('tags'), list) and len(user.get('tags')) > 0
    ])

    # Determine Early Adopter Badge
    early_adopter = False
    if user.get('created_at'):
        early_adopter_cutoff = datetime(2025, 12, 31)  # Updated cutoff date for early adopters
        if user['created_at'] < early_adopter_cutoff:
            early_adopter = True

    # Determine Connector Badge
    connector_badge = False
    connection_threshold = 5  # Example threshold for the badge
    if user.get('connected_users') and len(user['connected_users']) >= connection_threshold:
        connector_badge = True

    user_data = {
        'id': str(user['_id']),
        'email': user['email'],
        'name': user.get('name', ''),
        'campus': user.get('campus', ''),
        'course': user.get('course', ''),
        'tags': user.get('tags', []),
        'bio': user.get('bio', ''), #didnt include when making the inital user
        'previous_projects': user.get('current_work', ''), #didnt include when making the inital user
        'collab_interest': user.get('collab_interest', ''), #didnt include when making the inital user
        'want_to_build': user.get('want_to_build', {}),
        'links': user.get('links', {}),
        'profile_picture': user.get('profile_picture', ''),
        'specialization': user.get('specialization', ''),
        'badges': {
            'early_adopter': early_adopter,
            'connector': connector_badge
        },
        'completion_percentage': calculate_profile_completion(user),
        'profile_completed': profile_completed,
        'projects': user.get('projects', []),  # Fetch projects from the user document
        'connected_users': user.get('connected_users', [])
    }

    return jsonify({'user': user_data}), 200

@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()
    data = request.json

    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'msg': 'User not found'}), 404

    allowed_fields = ['name', 
                      'course',
                      'tags',
                      'campus',
                      'bio', 
                      'profile_picture',
                      'purpose',
                      'specialization',  # Accepts both predefined and custom values
                      'lookingFor',
                      'current_project']

    update_data = {field: data[field] for field in allowed_fields if field in data}

    if 'tags' in update_data and not isinstance(update_data['tags'], list):
        return jsonify({'msg': 'Invalid tag type, must be a list'}), 400

    try:
        # Update user profile
        users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})

        # Check if profile is complete
        updated_user = users.find_one({'_id': ObjectId(user_id)})
        profile_completed = all([
            updated_user.get('name'),
            updated_user.get('bio'),
            updated_user.get('purpose'),
            updated_user.get('lookingFor') and isinstance(updated_user.get('lookingFor'), list) and len(updated_user.get('lookingFor')) > 0,
            updated_user.get('tags') and isinstance(updated_user.get('tags'), list) and len(updated_user.get('tags')) > 0
        ])

        # Calculate profile completion percentage
        completion_percentage = calculate_profile_completion(updated_user)

        # Save completion percentage to the database
        users.update_one({'_id': ObjectId(user_id)}, {'$set': {'completion_percentage': completion_percentage}})

        if profile_completed:
            # Mark profile as completed and issue a new JWT
            users.update_one({'_id': ObjectId(user_id)}, {'$set': {'profile_completed': True}})
            new_token = create_access_token(identity=str(user_id), expires_delta=timedelta(days=7))
            return jsonify({
                'msg': 'Profile updated successfully', 
                'token': new_token, 
                'completion_percentage': completion_percentage
            }), 200

        return jsonify({
            'msg': 'Profile updated successfully, but not complete. Please complete all required fields.'
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in update_profile: {str(e)}", exc_info=True)
        return jsonify({'msg': f'An error occurred: {str(e)}'}), 500

@users_bp.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()
    data = request.json

    # Validate request body
    required_fields = ['title', 'description', 'links', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'msg': f'Missing required field: {field}'}), 400

    # Prepare the new project
    new_project = {
        'title': data['title'],
        'description': data['description'],
        'links': data.get('links', {}),
        'role': data['role'],
        'image': data.get('image', '')  # Optional field
    }

    # Update the user's projects array
    result = users.update_one(
        {'_id': ObjectId(user_id)},
        {'$push': {'projects': new_project}}
    )

    if result.modified_count == 0:
        return jsonify({'msg': 'Failed to add project'}), 500

    return jsonify({'msg': 'Project added successfully', 'project': new_project}), 201

@users_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    mongo = current_app.mongo
    users = mongo.db.users
    user_id = get_jwt_identity()

    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'msg': 'User not found'}), 404

    projects = user.get('projects', [])  # Fetch projects from the user document

    return jsonify({'projects': projects}), 200


def calculate_profile_completion(user):
    fields = [
        ('name', str),
        ('course', str),
        ('bio', str),
        ('current_project', dict),
        ('links', dict),
        ('previous_projects', list)
    ]

    completed = 0

    for field, expected_type in fields:
        value = user.get(field)
        if expected_type == str and isinstance(value, str) and value.strip():
            completed += 1
        elif expected_type == list and isinstance(value, list) and len(value) > 0:
            completed += 1
    percentage = int((completed / len(fields)) * 100)
    return percentage















