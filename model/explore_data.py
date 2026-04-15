import pandas as pd
import numpy as np

# ── Load dataset ──────────────────────────────────────────
df = pd.read_csv('../data/dataset.csv')

# ── Basic info ────────────────────────────────────────────
print("=" * 50)
print("DATASET SHAPE")
print("=" * 50)
print(f"Rows    : {df.shape[0]}")
print(f"Columns : {df.shape[1]}")

print("\n" + "=" * 50)
print("COLUMN NAMES + DATA TYPES")
print("=" * 50)
print(df.dtypes)

print("\n" + "=" * 50)
print("FIRST 5 ROWS")
print("=" * 50)
print(df.head())

print("\n" + "=" * 50)
print("LABEL DISTRIBUTION (0=Normal, 1=Ransomware)")
print("=" * 50)
counts = df['label'].value_counts()
print(counts)
print(f"\nNormal     : {counts[0]} rows ({counts[0]/len(df)*100:.1f}%)")
print(f"Ransomware : {counts[1]} rows ({counts[1]/len(df)*100:.1f}%)")

print("\n" + "=" * 50)
print("MISSING VALUES PER COLUMN")
print("=" * 50)
missing = df.isnull().sum()
print(missing[missing > 0] if missing.sum() > 0 else "No missing values!")

print("\n" + "=" * 50)
print("BASIC STATISTICS")
print("=" * 50)
print(df.describe())