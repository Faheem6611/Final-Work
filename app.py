from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import mail
from werkzeug.security import generate_password_hash, check_password_hash
import os
import pickle
from flask_mail import Mail, Message
app = Flask(__name__)
CORS(app)
# ===============================
# EMAIL CONFIGURATION
# ===============================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")

mail = Mail(app)
# ===============================
# DATABASE SETUP
# ===============================
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ===============================
# DATABASE MODELS
# ===============================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)

with app.app_context():
    db.create_all()

# ===============================
# LOAD AI MODEL
# ===============================
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("fake_review_model.pkl", "rb") as f:
    model = pickle.load(f)

# Use integer keys because model.predict returns int
label_map = {
    1: "Genuine Review ✅",
    0: "Fake Review ❌"
}

# ===============================
# FRONTEND ROUTE
# ===============================
@app.route("/")
def home():
    return render_template("index.html")

# ===============================
# CHECK REVIEW API
# ===============================
@app.route("/api/check_review", methods=["POST"])
def check_review():
    data = request.get_json()
    review_text = data.get("review", "").strip()

    if not review_text:
        return jsonify({"error": "No review text provided"}), 400

    try:
        X = vectorizer.transform([review_text])
        prediction = int(model.predict(X)[0])
        human_label = label_map.get(prediction, str(prediction))

        confidence = 0.0
        if hasattr(model, "predict_proba"):
            prob_array = model.predict_proba(X)[0]
            classes = list(model.classes_)
            idx = classes.index(prediction)
            confidence = float(prob_array[idx])

        return jsonify({
            "review": review_text,
            "prediction": human_label,
            "confidence": round(confidence, 2),
            "confidence_percent": round(confidence * 100)
        }), 200

    except Exception as e:
        print("Error in /api/check_review:", e)
        return jsonify({"error": "Failed to analyze review"}), 500

# ===============================
# SIGNUP API
# ===============================
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered"}), 400

    password_hash = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Account created successfully"})

# ===============================
# LOGIN API
# ===============================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({"success": True, "message": f"Welcome back, {user.name}!", "name": user.name})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

# ===============================
# LOGOUT API
# ===============================
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()   # removes user session
    return jsonify({"success": True})

# ===============================
# CONTACT API
# ===============================
@app.route("/api/contact", methods=["POST"])
def contact():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    if not all([name, email, subject, message]):
        return jsonify({"success": False, "message": "All fields required"}), 400

    # Save to database
    new_message = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message
    )

    db.session.add(new_message)
    db.session.commit()

    # Send email
    try:

        msg = Message(
            subject=f"New Contact: {subject}",
            sender=app.config['MAIL_USERNAME'],
            recipients=['muhammadfaheemiqbal297@gmail.com']
        )

        msg.body = f"""
New Contact Message

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
"""

        mail.send(msg)

    except Exception as e:
        print("Email error:", e)

    return jsonify({
        "success": True,
        "message": "Message sent successfully"
    })
# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

