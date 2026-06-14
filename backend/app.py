from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import register_user, login_user, verify_token
from models import init_db, save_history, get_history
from analyze import analyze_image, search_medicine
import os
import mimetypes
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

init_db()

@app.route("/signup", methods=["POST"])
def signup():
    return register_user(request.get_json())

@app.route("/login", methods=["POST"])
def login():
    return login_user(request.get_json())

@app.route("/verify", methods=["POST"])
def verify():
    token = request.headers.get("Authorization")
    if not verify_token(token):
        return jsonify({"error": "Unauthorized"}), 401
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(path)
    mime = mimetypes.guess_type(path)[0] or "image/jpeg"

    try:
        result = analyze_image(path, mime)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    save_history(result)
    return jsonify(result)

@app.route("/medicine", methods=["GET"])
def medicine():
    token = request.headers.get("Authorization")
    if not verify_token(token):
        return jsonify({"error": "Unauthorized"}), 401
    name = request.args.get("name", "").strip()
    if not name:
        return jsonify({"error": "Medicine name required"}), 400
    try:
        result = search_medicine(name)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(result)

@app.route("/history", methods=["GET"])
def history():
    token = request.headers.get("Authorization")
    if not verify_token(token):
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(get_history())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)