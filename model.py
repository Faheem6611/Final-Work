# train_fake_review_model.py

import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import pickle
import os

# ------------------------------
# Download NLTK stopwords
# ------------------------------
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# ------------------------------
# Load Dataset
# ------------------------------
# Replace 'reviews.csv' with your dataset path
# Dataset must have 'review' and 'label' columns
df = pd.read_csv("Review.csv")
print("Dataset head:")
print(df.head())
print("\nLabel distribution:")
print(df['label'].value_counts())

print(df.columns)   # run once to confirm names

X = df['text_']     # review text column
y = df['label']    # or the numeric label column


# ------------------------------
# Text Preprocessing
# ------------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', '', text)
    text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

X_clean = X.apply(clean_text)

# ------------------------------
# Split Train/Test
# ------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_clean, y, test_size=0.2, random_state=42
)

print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")

# ------------------------------
# TF-IDF Vectorization
# ------------------------------
vectorizer = TfidfVectorizer(max_features=40000 , ngram_range=(1,2))
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Save vectorizer
with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
print("Vectorizer saved as vectorizer.pkl")

# ------------------------------
# Train Logistic Regression Model
# ------------------------------
model = LogisticRegression(max_iter=1000, class_weight='balanced')
model.fit(X_train_vec, y_train)

# Evaluate
y_pred = model.predict(X_test_vec)
accuracy = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {accuracy*100:.2f}%")

# Save model
with open("fake_review_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("Model saved as fake_review_model.pkl")

# ------------------------------
# Test Example
# ------------------------------
sample_review = ["This product is amazing and works perfectly!"]
sample_vec = vectorizer.transform(sample_review)
sample_pred = model.predict(sample_vec)[0]
print(f"Sample Review Prediction: {'Genuine ✅' if sample_pred==1 else 'Fake ❌'}")
