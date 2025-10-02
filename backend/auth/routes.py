from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from bson import ObjectId
from datetime import datetime, timedelta
import re, traceback
import json
from utils.profile import score_profile


auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        mongo = current_app.mongo
        users = mongo.db.users
        data = request.json

        print(type(data))

        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception as e:
                print("[/bad payload ERROR]", e)
                print(traceback.format_exc())
                return jsonify({"msg": "Invalid JSON payload"}), 400
        
        data = data or {}

        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()
        name = (data.get("name") or "").strip()

        if not email or not password:
            return jsonify({"msg": "Email and password required"}), 400

        if users.find_one({'email': data['email']}):
            print("here") #this is cousing the issue
            return jsonify({'msg': 'Email already exists'}), 400
        

        hashed_pw = current_app.bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = {
            'email': email,
            'password': hashed_pw,
            'name': name,
            'course': data.get('course', ''), 
            'tags': data.get('tags', []),
            'campus': data.get('campus', ''),
            'links': data.get('links', {}),
            'bio': '',
            'specialization': '',
            'previous_projects': [],
            'current_project': [],
            "want_to_build": {"blurb": "", "roles_needed": []},
            'created_at': datetime.utcnow(),
        }

        if not isinstance(data.get('tags', []), list):
            return jsonify({'msg': 'Tags must be a list'}), 400
        if not isinstance(data.get('links', {}), dict):
            return jsonify({'msg': 'Links must be an object'}), 400

        score, missing = score_profile(user)
        user["profile_score"] = score
        user["profile_missing_core"] = missing


        result = users.insert_one(user)

        # Issue a temporary JWT
        temporary_token = create_access_token(identity=str(result.inserted_id), expires_delta=timedelta(minutes=30))

        return jsonify({'msg': 'Account created', 'id': str(result.inserted_id), 'token': temporary_token}), 201
    except Exception as e: 
        print("[/register ERROR]", e)
        print(traceback.format_exc())
        return jsonify({"msg": "Internal error during register"}), 500



@auth_bp.route('/login', methods=['POST'])
def login():
    mongo = current_app.mongo
    users = mongo.db.users
    data = request.get_json()
    print(type(data))

    email = data.get("email").strip().lower()

    user = users.find_one({'email': email})

    print("[LOGIN DEBUG] body_keys:", list(data.keys()))

    if user:
        print("found a user")

    #check if the email is valid

    if not user or not current_app.bcrypt.check_password_hash(user['password'], data['password']):
        print("stock here")
        return jsonify({'msg', 'Invalid credentials'}), 401

    print("wowww")
    
    token = create_access_token(identity=str(user['_id']))
    safe = {
        'id': str(user['_id']),
        'name': user['name'],
        'course': user['course'],
        'campus': user['campus']
    }

    return jsonify({"token": token, "user": safe}), 200

def obj_id(s):
    try:
        return ObjectId(s)
    except:
        return None

@auth_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    mongo = current_app.mongo
    uid = obj_id(get_jwt_identity())
    if not uid: return {"ok": False, "error": "Bad token"}, 401
    user = mongo.db.users.find_one({"_id": uid}, {"password": 0})
    if not user: return {"ok": False, "error": "User not found"}, 404
    user["id"] = str(user.pop("_id"))
    return {"ok": True, "data": user}, 200


