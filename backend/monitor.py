import psutil
import os
import joblib
import pandas as pd
import numpy as np
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RansomwareMonitor:
    def __init__(self, model_path, features_path):
        self.model = joblib.load(model_path)
        self.features = joblib.load(features_path)
        self.file_change_count = 0
        
    def get_system_metrics(self):
        """Extract features from the live system to match the model's feature set."""
        try:
            pids = psutil.pids()
            process_list = list(psutil.process_iter(['num_threads', 'num_handles']))
            
            total_threads = sum([p.info['num_threads'] or 0 for p in process_list])
            total_handles = sum([p.info['num_handles'] or 0 for p in process_list]) if os.name == 'nt' else 0
            
            # Simple mapping to proxied features
            # Note: In a real scenarios, you'd want more complex feature mapping
            metrics = {
                'pslist.nproc': len(pids),
                'pslist.avg_threads': total_threads / len(pids) if pids else 0,
                'handles.nhandles': total_handles,
                'handles.avg_handles_per_proc': total_handles / len(pids) if pids else 0,
            }
            
            # Fill the full feature vector expected by the model
            input_data = {}
            for feat in self.features:
                input_data[feat] = metrics.get(feat, 0.0)
            
            # Boost probability if file activity is very high (Heuristic + ML)
            # This compensates for the fact that psutil doesn't give memory forensics details directly
            if self.file_change_count > 50:
                 input_data['malfind.ninjections'] = self.file_change_count / 10
            
            df = pd.DataFrame([input_data])
            return df
        except Exception as e:
            print(f"Error collecting metrics: {e}")
            return pd.DataFrame([ {feat: 0.0 for feat in self.features} ])

    def predict(self):
        df = self.get_system_metrics()
        prediction = self.model.predict(df)[0]
        # Calculate risk score based on probability
        prob = self.model.predict_proba(df)[0]
        risk_score = prob[1] * 100
        
        # Reset activity counters
        self.file_change_count = 0
        
        return int(prediction), float(risk_score)

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, monitor):
        self.monitor = monitor
    def on_any_event(self, event):
        if not event.is_directory:
            self.monitor.file_change_count += 1
