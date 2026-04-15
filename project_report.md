# Sentinel AI: Project Report & User Guide

## 1. Project Overview
**Sentinel AI** is a professional-grade, Zero-Day Ransomware Detection system. Unlike traditional antivirus software that relies on "signatures" (lists of known viruses), Sentinel AI uses **Behavioral Analysis**. It monitors system metrics in real-time and uses a Machine Learning model to detect the *actions* of ransomware, allowing it to stop never-before-seen threats.

---

## 2. Technical Architecture

### A. The Detection Engine (Machine Learning)
- **Algorithm**: Random Forest Classifier.
- **Training Data**: Memory forensics data points (CPU spikes, memory allocation shifts, process counts).
- **Core Logic**: The model is trained to recognize the "Digital Signature" of encryption activity, which typically involves high CPU usage and rapid file modifications.

### B. The Backend (Python & Flask)
- **Monitoring**: Uses the `psutil` library for system telemetry and `watchdog` to monitor the file system.
- **Integration**: Communicates with a **Supabase** Postgres database to store logs and broadcast real-time alerts.
- **Pathing**: Built with absolute path resolution to ensure reliability across different environments.

### C. The Frontend (React & Tailwind CSS)
- **Real-time Engine**: Connects to Supabase via WebSockets (Postgres Changes) to provide instant UI updates without refreshing.
- **Aesthetics**: A modern, "Cyber-Security Blue" theme using **Tailwind CSS v4** for a clean, professional, and sharp look.
- **Navigation**: A multi-tab system (Dashboard, Security Alerts, Activity Logs, Settings) allows for deep inspection of system health.

---

## 3. How to Use the System

### Phase 1: Installation & Startup
1. **Prerequisites**: Ensure you have Python and Node.js installed.
2. **The "Easy Button"**: In the project root, find the `run.bat` file. 
3. **Execution**: Double-click `run.bat`. This will:
   - Start the AI Monitoring loop in one window.
   - Start the Web Dashboard in another window.
   - Automatically open your browser to the dashboard.

### Phase 2: Navigating the Dashboard
- **Dashboard Home**: View live graphs of your CPU and Memory. The "System Health" card will show "Secure" in green during normal operations.
- **Security Alerts**: This is where detected threats appear. Each alert includes a **Risk Score** and a description of why the AI flagged the event.
- **Activity Logs**: A full history of every system "snapshot" taken by the AI, showing exactly what your PC was doing at any given time.
- **Settings**: View the technical configuration, such as polling rates and the AI model version.

### Phase 3: Testing the AI (Safe Simulation)
To verify it works without risking your actual files:
1. Double-click `run_simulation.bat`.
2. This script creates a "sandbox" folder and simulates rapid file encryption.
3. Observe the dashboard: The **System Health** indicator will turn red and display **"Threat Blocked"**, and a new entry will appear in the **Security Alerts** feed.

---

## 4. Security & Safety Note
> [!IMPORTANT]
> This system is designed for **detection and simulation**. The provided simulation script only interacts with a specific folder called `simulation/sandbox` and does not harm your personal data. 

## 5. Review & Conclusion
The system successfully bridges the gap between complex Machine Learning forensics and a user-friendly interface. It provides high-visibility into system behavior and offers a robust defense against zero-day anomalies that traditional security tools might miss.

**Future Recommended Upgrades:**
- Integration of **Automatic Process Killing** (to stop the malicious process instantly).
- **Email/SMS Notifications** via Supabase Edge Functions.
- **Global Threat Intelligence Sharing** to update local models based on cloud data.
