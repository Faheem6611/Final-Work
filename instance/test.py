import pickle

# Load vectorizer and model
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("fake_review_model.pkl", "rb") as f:
    model = pickle.load(f)

# Mapping internal labels to human-readable labels
label_map = {
    "OR": "Genuine Review",
    "FAKE": "Fake Review",
    # Add other labels here if you have more
}

# Test text
text = ["This product is amazing! Best purchase ever!"]

# Transform text
X = vectorizer.transform(text)

# Predict
prediction = model.predict(X)
prediction_label = prediction[0]  # Extract string from array
human_readable = label_map.get(prediction_label, prediction_label)  # Map to readable label

# Optional: Get probabilities for each class
if hasattr(model, "predict_proba"):
    probs = model.predict_proba(X)[0]  # Probabilities for first input
    classes = model.classes_
    print("Class probabilities:")
    for cls, prob in zip(classes, probs):
        cls_name = label_map.get(cls, cls)
        print(f"{cls_name}: {prob:.4f}")

print("Prediction:", human_readable)

