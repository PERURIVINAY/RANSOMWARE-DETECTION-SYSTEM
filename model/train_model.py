import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# 1. Load Dataset
print("Loading dataset...")
data_path = os.path.join('data', 'dataset.csv')
if not os.path.exists(data_path):
    print(f"Error: {data_path} not found!")
    exit(1)

df = pd.read_csv(data_path)

# 2. Binary Classification: Benign (0) vs Ransomware (1)
# Category 'Benign' is 0, everything else (Ransomware-*) is 1
df['label'] = df['Category'].apply(lambda x: 0 if x == 'Benign' else 1)

# 3. Select Numeric Features (Excluding the target and non-numeric labels)
features = df.select_dtypes(include=[np.number]).columns.tolist()
if 'label' in features:
    features.remove('label')

X = df[features]
y = df['label']

# 4. Handle missing values
X = X.fillna(0)

# 5. Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Train Random Forest Model
print("Training Random Forest model (this may take a minute)...")
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 7. Evaluate
print("Evaluating model...")
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred))

# 8. Save Model and Features
print("Saving model files...")
os.makedirs('model', exist_ok=True)
joblib.dump(model, os.path.join('model', 'trained_model.pkl'))
joblib.dump(features, os.path.join('model', 'features.pkl'))

print("Phase 1 Complete: Model trained and saved.")
