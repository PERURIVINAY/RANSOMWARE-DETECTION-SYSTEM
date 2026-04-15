import os
import time
import random
import string

# Path to the sandbox directory (absolute relative to script)
SIM_DIR = os.path.dirname(os.path.abspath(__file__))
SANDBOX_DIR = os.path.join(SIM_DIR, 'sandbox')

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def simulate_activity():
    """
    Safely simulates ransomware-like behavior:
    1. Creates many files.
    2. Modifies them rapidly.
    3. Renames them with a common extension.
    """
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)
        print(f"[*] Created sandbox: {SANDBOX_DIR}")
    
    print(f"[*] Initializing SAFE Behavioral Simulation...")
    print("[*] Step 1: Generating 50 decoy sensitive documents...")
    
    for i in range(50):
        file_path = os.path.join(SANDBOX_DIR, f"private_records_{i}.docx")
        with open(file_path, "w") as f:
            f.write(f"CONFIDENTIAL DATA\nID: {random_string(20)}\nContent: {random_string(500)}")
    
    print("[*] Documents generated. Waiting for monitor to stabilize (5s)...")
    time.sleep(5)
    
    print("[!] ALERT: SIMULATING RAPID FILE ENCRYPTION...")
    files = [f for f in os.listdir(SANDBOX_DIR) if f.endswith(".docx")]
    
    start_time = time.time()
    for filename in files:
        old_path = os.path.join(SANDBOX_DIR, filename)
        new_path = os.path.join(SANDBOX_DIR, filename + ".sentinel_locked")
        
        # Simulate data modification (adding an 'encrypted' footer)
        try:
            with open(old_path, "a") as f:
                f.write("\n" + "="*20 + "\nENCRYPTED BY SIMULATION\n" + "="*20)
            
            # Simulate renaming
            os.rename(old_path, new_path)
            print(f"Modified & Renamed: {filename}")
        except Exception as e:
            print(f"Error modifying {filename}: {e}")
            
        # Fast modification is a key ransomware indicator
        time.sleep(0.08)

    duration = time.time() - start_time
    print(f"\n[+] Simulation Complete in {duration:.2f}s.")
    print("[+] The Backend monitor should detect this 'high-frequency file mutation' spike.")
    print("[+] Check the Dashboard/Supabase for new Threat Alerts.")

if __name__ == "__main__":
    try:
        # Run from project root
        simulate_activity()
    except KeyboardInterrupt:
        print("\n[!] Simulation aborted.")
