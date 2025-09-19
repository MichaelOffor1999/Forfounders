from flask import Flask, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from config import Config
from auth.routes import auth_bp
from users.routes import users_bp
from discovery.routes import discovery_bp
import certifi


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
mongo = PyMongo(app, tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.mongo = mongo
app.bcrypt = bcrypt





#test api
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

#register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(discovery_bp, url_prefix='/api')


if __name__ == '__main__':
    app.run(port = 5000, debug=True)


