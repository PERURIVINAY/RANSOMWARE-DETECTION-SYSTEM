# SENTINEL AI: Zero-Day Ransomware Detection System

An AI-powered cybersecurity platform designed to detect zero-day ransomware behavior through real-time system monitoring and behavioral analysis (anomaly detection).

## 🚀 Overview

Sentinel AI monitors system-level activity (CPU, Memory, File System Events) and uses a **Random Forest Machine Learning model** to identify patterns typical of ransomware (e.g., rapid file encryption/renaming and memory forensics anomalies).

### Key Features
- **AI Detection Engine**: Trained on memory forensics datasets to identify malicious behavior with high precision.
- **Real-time Monitoring**: Uses `psutil` and `watchdog` to track OS-level metrics.
- **Live Dashboard**: A premium, glassmorphism-style React interface for threat visualization.
- **Supabase Integration**: Persistent threat logging and real-time alert broadcasts.
- **Safe Simulation**: Built-in script to safely test detection capabilities.

---

## 🏗️ Project Structure

```text
ransomware_detection/
├── backend/                # Flask API and Monitoring Engine
│   ├── app.py             # Main Entry Point & Supabase Logic
│   ├── monitor.py         # System Monitoring Logic
│   └── requirements.txt   # Backend Dependencies
├── model/                  # AI Model Files
│   ├── train_model.py     # Model Training Script
│   ├── trained_model.pkl  # Serialized ML Model
│   └── features.pkl       # Feature Metadata
├── frontend/               # React Dashboard (Vite)
│   ├── src/               # UI Source Code (App.jsx, index.css)
│   └── package.json       # Frontend Dependencies
└── simulation/             # Safe Testing Environment
    ├── simulate_attack.py # Safe Ransomware Simulation Script
    └── sandbox/           # Folder for simulation activity
```

---



### 1. Launch the Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The backend will start a background monitoring thread and expose the API at http://localhost:5000.*

### 2. Launch the Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open the provided Vite URL (usually http://localhost:5173) to view the real-time dashboard.*

### 3. Test the System (Simulation)
Open a new terminal and run:
```bash
python simulation/simulate_attack.py
```
*Wait a few seconds and you will see the **CPU spikes** and **Threat Alerts** appear live on your dashboard.*

---

## ⚠️ Important Note
This system is intended for **educational and defensive research purposes only**. It does not execute real ransomware or harmful code. It simulates behavior by rapidly modifying files in a controlled `simulation/sandbox` directory.
