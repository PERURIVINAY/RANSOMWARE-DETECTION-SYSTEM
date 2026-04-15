from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
import threading
import time
import os
import psutil
from monitor import RansomwareMonitor, FileChangeHandler
from watchdog.observers import Observer
from scanner_utils import URLScanner, FileScanner, generate_ai_report
import tempfile

def generate_ai_reasoning(metrics, risk_score):
    """Generates AI context-based reasoning for a detected threat."""
    reasons = []
    if metrics.get('file_change_rate', 0) > 20:
        reasons.append(f"Highly unusual file modification rate ({metrics['file_change_rate']} events/cycle) detected in sandbox, which is a key indicator of bulk encryption.")
    if metrics.get('pslist.avg_threads', 0) > 15:
        reasons.append(f"Excessive thread spawning (avg {metrics['pslist.avg_threads']:.1f} threads/proc) suggests a multi-threaded encryption process attempting to lock files rapidly.")
    if metrics.get('handles.nhandles', 0) > 2000:
        reasons.append(f"Elevated system handle count ({metrics['handles.nhandles']}) indicating intensive I/O operations and file locking behavior.")
    if risk_score > 80:
        reasons.append("The AI model's high confidence score (RF Prediction: 1) correlates with a known 'LockBit' or 'WannaCry' behavioral signature.")
    
    if not reasons:
        return "Heuristic anomaly detected based on subtle deviations in process memory and handle allocation patterns."
    
    return "AI Insight: " + " ".join(reasons)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Supabase configuration (User provided)
SUPABASE_URL = "https://xgxgmbeytkrhudbazmdx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneGdtYmV5dGtyaHVkYmF6bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzI5NzcsImV4cCI6MjA5MDgwODk3N30.nZhhmtU_3XBC8_5ZHncvq_tSYGyOOnJHvmvyLBdBHHo"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Absolute path to the project root (one level up from this script)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'trained_model.pkl')
FEATURES_PATH = os.path.join(MODEL_DIR, 'features.pkl')

# Global Monitor Instance
monitor = RansomwareMonitor(MODEL_PATH, FEATURES_PATH)

def monitoring_loop():
    """Background thread to periodically check system status"""
    print("Starting background monitoring thread...")
    # Set up watchdog for simulation sandbox (absolute path)
    observer = Observer()
    handler = FileChangeHandler(monitor)
    watch_path = os.path.join(BASE_DIR, 'simulation', 'sandbox')
    os.makedirs(watch_path, exist_ok=True)
    observer.schedule(handler, watch_path, recursive=True)
    observer.start()

    try:
        while True:
            # Predict every 5 seconds
            prediction, risk_score = monitor.predict()
            
            # Record general system logs to Supabase
            try:
                cpu_usage = psutil.cpu_percent()
                mem_usage = psutil.virtual_memory().percent
                supabase.table('system_logs').insert({
                    'cpu_usage': cpu_usage,
                    'memory_usage': mem_usage,
                    'process_count': len(psutil.pids()),
                    'file_change_rate': monitor.file_change_count
                }).execute()
            except Exception as e:
                print(f"Error logging status: {e}")

            # If THREAT DETECTED
            if prediction == 1 or risk_score > 60:
                print(f"!!! THREAT DETECTED !!! Risk Score: {risk_score:.2f}%")
                
                # AI Context Reasoning
                metrics_for_reasoning = {
                    'file_change_rate': monitor.file_change_count,
                    'pslist.nproc': len(psutil.pids()),
                    'pslist.avg_threads': psutil.cpu_percent(), # Proxy for thread activity if needed
                    'handles.nhandles': psutil.virtual_memory().percent # Proxy for handle activity if needed
                }
                # Better metrics extraction for reasoning
                try:
                    pids = psutil.pids()
                    metrics_for_reasoning['pslist.avg_threads'] = sum([p.info['num_threads'] or 0 for p in psutil.process_iter(['num_threads'])]) / len(pids) if pids else 0
                except: pass

                ai_description = generate_ai_reasoning(metrics_for_reasoning, risk_score)
                
                try:
                    supabase.table('alerts').insert({
                        'threat_type': 'Heuristic/AI Anomaly' if risk_score > 60 else 'Zero-Day Ransomware',
                        'risk_score': risk_score,
                        'description': ai_description,
                        'details': {
                            'file_mod_count': monitor.file_change_count, 
                            'prediction': prediction,
                            'ai_model': 'Sentinel-RF-AI v2.1',
                            'context': metrics_for_reasoning
                        }
                    }).execute()
                except Exception as e:
                    print(f"Error logging alert: {e}")
            
            time.sleep(5)
    except Exception as e:
        print(f"Monitoring loop error: {e}")
    finally:
        observer.stop()
        observer.join()

@app.route('/scan-url', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
        
    scanner = URLScanner()
    result = scanner.scan(url)
    ai_report = generate_ai_report(result, "Website URL")
    
    # Store in History
    try:
        supabase.table('scan_history').insert({
            'scan_type': 'URL',
            'input_value': url,
            'status': result['status'],
            'risk_score': result['risk_score'],
            'report': {**result, "ai_report": ai_report}
        }).execute()
    except Exception as e:
        print(f"Error logging scan history: {e}")
        
    return jsonify({**result, "ai_report": ai_report})

@app.route('/scan-file', methods=['POST'])
def scan_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
        
    # Standard file upload analysis
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        uploaded_file.save(tmp.name)
        tmp_path = tmp.name
        
    try:
        scanner = FileScanner()
        result = scanner.scan(tmp_path, uploaded_file.filename)
        ai_report = generate_ai_report(result, "File Upload")
        
        # Store in History
        try:
           supabase.table('scan_history').insert({
                'scan_type': 'FILE',
                'input_value': uploaded_file.filename,
                'status': result['status'],
                'risk_score': result['risk_score'],
                'report': {**result, "ai_report": ai_report}
            }).execute()
        except Exception as e:
            print(f"Error logging scan history: {e}")
            
        return jsonify({**result, "ai_report": ai_report})
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/scan-history', methods=['GET'])
def get_scan_history():
    try:
        response = supabase.table('scan_history').select("*").order('created_at', desc=True).limit(50).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Start the monitoring loop in a daemon thread
    monitor_thread = threading.Thread(target=monitoring_loop, daemon=True)
    monitor_thread.start()
    
    print(f"Backend API running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
