<div align="center">

# 🛡️ Sentinel AI
### Zero-Day Ransomware Detection System

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-API-black?style=for-the-badge&logo=flask&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An AI-powered cybersecurity platform that detects zero-day ransomware in real time through behavioral analysis — no virus signatures needed.**

[Features](#-key-features) · [Architecture](#-technical-architecture) · [Project Structure](#-project-structure) · [Quick Start](#-quick-start) · [Dashboard Guide](#-navigating-the-dashboard) · [Testing](#-testing-the-ai) · [Roadmap](#-future-roadmap)

---

</div>

## 🔍 Project Overview

**Sentinel AI** is a professional-grade, zero-day ransomware detection system. Unlike traditional antivirus software that relies on *signature databases* (lists of known viruses), Sentinel AI uses **Behavioral Analysis** — monitoring system metrics in real time and using a Machine Learning model to detect the *actions* of ransomware.

This means it can stop **never-before-seen threats** by recognizing what ransomware *does*, not just what it *looks like*.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Detection Engine** | Random Forest classifier trained on memory forensics data to identify malicious behavior with high precision |
| 📊 **Real-Time Monitoring** | Tracks CPU, Memory, and File System events using `psutil` and `watchdog` |
| 🖥️ **Live Dashboard** | Glassmorphism-style React interface with live threat visualization |
| ⚡ **Instant Alerts** | Supabase WebSocket integration pushes alerts to the UI without page refresh |
| 🗃️ **Persistent Logging** | All threat events and system snapshots stored in a Supabase Postgres database |
| 🧪 **Safe Simulation** | Built-in sandboxed script to safely test detection without touching real files |

---

## 🏗️ Technical Architecture

### A. The Detection Engine — Machine Learning

- **Algorithm**: Random Forest Classifier
- **Training Data**: Memory forensics data points — CPU spikes, memory allocation shifts, process counts
- **Core Logic**: Trained to recognize the *"digital signature"* of encryption activity, which typically manifests as high CPU usage paired with rapid file modifications

### B. The Backend — Python & Flask

- **Monitoring**: `psutil` for system telemetry, `watchdog` for file system surveillance
- **Integration**: Communicates with a **Supabase** Postgres database to store logs and broadcast real-time alerts via WebSockets
- **Pathing**: Built with absolute path resolution for reliability across environments

### C. The Frontend — React & Tailwind CSS

- **Real-Time Engine**: Connects to Supabase via Postgres Changes (WebSockets) for instant UI updates
- **Aesthetics**: Modern *"Cyber-Security Blue"* theme built with **Tailwind CSS v4** — clean, sharp, and professional
- **Navigation**: Multi-tab system (Dashboard, Security Alerts, Activity Logs, Settings) for deep system inspection

---

## 📁 Project Structure

```text
ransomware_detection/
├── backend/                    # Flask API and Monitoring Engine
│   ├── app.py                 # Main entry point & Supabase logic
│   ├── monitor.py             # System monitoring logic (psutil + watchdog)
│   └── requirements.txt       # Backend dependencies
│
├── model/                      # AI Model Files
│   ├── train_model.py         # Model training script
│   ├── trained_model.pkl      # Serialized ML model (Random Forest)
│   └── features.pkl           # Feature metadata
│
├── frontend/                   # React Dashboard (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main UI component
│   │   └── index.css          # Global styles
│   └── package.json           # Frontend dependencies
│
├── simulation/                 # Safe Testing Environment
│   ├── simulate_attack.py     # Sandboxed ransomware simulation
│   └── sandbox/               # Isolated folder for simulation activity
│
└── run.bat                     # 🚀 One-click startup script (Windows)
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) project (for database and real-time alerts)

---

### ⚡ Option 1 — Easy Mode (Windows)

Simply double-click `run.bat` in the project root. It will:

1. Start the AI monitoring loop in one terminal window
2. Start the React dashboard in another terminal window
3. Automatically open your browser to the dashboard

---

### 🛠️ Option 2 — Manual Setup

**Step 1: Start the Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
> The backend starts a background monitoring thread and exposes the API at `http://localhost:5000`

**Step 2: Launch the Dashboard**
```bash
cd frontend
npm install
npm run dev
```
> Open the Vite URL (usually `http://localhost:5173`) to view the live dashboard

**Step 3: Run the Simulation (Optional)**
```bash
python simulation/simulate_attack.py
```
> Wait a few seconds — you'll see CPU spikes and threat alerts appear live on your dashboard

---

## 🖥️ Navigating the Dashboard

Once running, the dashboard is organized into four tabs:

| Tab | Purpose |
|---|---|
| **🏠 Dashboard Home** | Live graphs of CPU and Memory usage. "System Health" shows **Secure** (green) during normal operations |
| **🚨 Security Alerts** | Displays detected threats with a **Risk Score** and AI-generated reason for each flag |
| **📋 Activity Logs** | Full history of every system snapshot — see exactly what your PC was doing at any given time |
| **⚙️ Settings** | View technical configuration: polling rates, AI model version, and database status |

---

## 🧪 Testing the AI

To verify the system works **without risking any real files**:

1. Double-click `run_simulation.bat` (or run `python simulation/simulate_attack.py`)
2. The script creates an isolated `simulation/sandbox/` folder and simulates rapid file encryption inside it
3. Watch the dashboard respond in real time:
   - **System Health** indicator turns 🔴 **red**
   - Status changes to **"Threat Blocked"**
   - A new entry appears in the **Security Alerts** feed with a Risk Score and description

> [!IMPORTANT]
> **The simulation is completely safe.** It only interacts with the `simulation/sandbox/` folder and does not modify, encrypt, or delete any personal files.

---

## ⚠️ Disclaimer

This project is intended for **educational and defensive research purposes only**. It does not execute real ransomware or harmful code. All attack simulation is confined to a controlled sandbox directory and poses no risk to your system.

---

## 🔮 Future Roadmap

- [ ] **Automatic Process Killing** — instantly terminate the malicious process upon detection
- [ ] **Email / SMS Notifications** via Supabase Edge Functions
- [ ] **Global Threat Intelligence Sharing** — update local models from cloud-sourced threat data
- [ ] **Linux & macOS Support** — cross-platform startup scripts
- [ ] **Model Retraining Pipeline** — continuously improve detection accuracy from new logs

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for bug fixes, new features, or documentation improvements.

---

<div align="center">

Built with 🔵 by the Sentinel AI team · Powered by Random Forest, Flask, React & Supabase

</div>
