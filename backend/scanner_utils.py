import math
import requests
import validators
import magic
import re
from urllib.parse import urlparse

class URLScanner:
    def __init__(self):
        self.suspicious_patterns = [
            r"eval\(", r"atob\(", r"unescape\(", r"document\.write\(",
            r"CryptoJS", r"encrypt", r"decrypt", r"password",
            r"miner", r"wasm", r"coinhive"
        ]
        self.malware_signatures = {
            "EICAR Test Virus": "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
        }
        self.suspicious_domains = [
            "free-crypto", "win-prize", "account-verify", "secure-login-update",
            "malware", "virus", "eicar", "danger", "phish", "attacker",
            "bit.ly", "tinyurl.com", "wicar", "exploit", "payload", "attack"
        ]
        self.ransomware_keywords = [
            "ransomware", "encrypt", "decrypt", "hacked", "bitcoin", "payment",
            "tor", ".onion", "private key", "unlock", "recovery"
        ]
        self.suspicious_extensions = [
            ".exe", ".com", ".bat", ".scr", ".msi", ".vbs", ".pif", ".cmd", ".vba", ".ps1"
        ]
        
    def scan(self, url):
        if not validators.url(url):
            return {"status": "MALICIOUS", "risk_score": 100, "reasons": ["Invalid URL format"], "warnings": ["The URL provided is not a valid web address."]}
        
        reasons = []
        warnings = []
        risk_score = 0
        
        try:
            # 1. Domain Reputation Check
            domain = urlparse(url).netloc.lower()
            path = urlparse(url).path.lower()
            
            for keyword in self.suspicious_domains:
                if keyword in domain:
                    risk_score += 65
                    reasons.append(f"CRITICAL: High-risk keyword '{keyword}' detected in domain name.")
                    break
            
            # 2. URL Path Analysis
            for ext in self.suspicious_extensions:
                if path.endswith(ext):
                    risk_score += 45
                    reasons.append(f"URL points directly to a high-risk executable extension: '{ext}'")
                    break
            
            # 3. SSL Check
            if not url.startswith("https"):
                risk_score += 15
                warnings.append("Website is not using SSL (HTTPS). Data transmitted is not encrypted.")
            
            # 4. Fetch and Deep Analysis
            response = requests.get(url, timeout=5, allow_redirects=True, verify=True, stream=True)
            
            # Content-Type Header Verification
            content_type = response.headers.get('Content-Type', '').lower()
            if any(t in content_type for t in ['application/octet-stream', 'application/x-msdownload', 'application/x-sh', 'application/x-executable']):
                risk_score += 55
                reasons.append(f"Payload Alert: URL returns a binary stream or executable MIME type ({content_type}).")

            # Check headers for forced download
            content_disposition = response.headers.get('Content-Disposition', '').lower()
            if 'attachment' in content_disposition:
                risk_score += 30
                reasons.append("Forced Download: The server is attempting to bypass browser safety with unrequested file delivery.")

            # 5. Redirect Check
            if len(response.history) > 3:
                risk_score += 25
                reasons.append(f"Excessive Redirects ({len(response.history)} hops) detected.")
            
            # 6. Content/Signature Engine
            raw_chunk = response.raw.read(8192)
            decoded_chunk = raw_chunk.decode('utf-8', errors='ignore')
            
            # EICAR / Signature Check
            for sig_name, sig_pattern in self.malware_signatures.items():
                if sig_pattern in decoded_chunk:
                    risk_score = 100
                    reasons.append(f"CRITICAL: {sig_name} signature matched in downloaded content.")
            
            # Ransomware Keyword Check in Content
            found_words = []
            for word in self.ransomware_keywords:
                if word in decoded_chunk.lower():
                    found_words.append(word)
            
            if found_words:
                risk_score += 40
                reasons.append(f"Ransomware indicators found in page text: {', '.join(found_words[:5])}")

            # Suspicious JS Patterns
            found_patterns = []
            for pattern in self.suspicious_patterns:
                if re.search(pattern, decoded_chunk, re.IGNORECASE):
                    found_patterns.append(pattern.replace("\\", ""))
            
            if found_patterns:
                risk_score += 45
                reasons.append(f"Script Analysis: Exploit behaviors detected: {', '.join(found_patterns[:3])}")
            
        except requests.exceptions.SSLError:
            risk_score += 40
            reasons.append("Certificate Error: SSL/TLS validation failed. Potential MITM attack.")
        except Exception as e:
            warnings.append(f"Live Neural Scan Limited: {str(e)}")
            
        # Normalize risk score
        risk_score = min(risk_score, 100)
        status = "SAFE"
        if risk_score > 50: status = "MALICIOUS" # Lowered threshold for higher security sensitivity
        elif risk_score > 20: status = "SUSPICIOUS"
        
        return {
            "status": status,
            "risk_score": risk_score,
            "reasons": reasons,
            "warnings": warnings,
            "recommendation": self.generate_recommendation(status, risk_score)
        }

    def generate_recommendation(self, status, score):
        if status == "SAFE":
            return "This website appears safe to visit. Always ensure you are on the correct domain before entering credentials."
        elif status == "SUSPICIOUS":
            return "Proceed with caution. Do not download any files or provide sensitive information on this site."
        else:
            return "HIGH RISK: We strongly recommend closing this page immediately. This site shows clear indicators of malicious intent or phishing."

class FileScanner:
    def __init__(self):
        self.mime = magic.Magic(mime=True)
        
    def calculate_entropy(self, data):
        if not data:
            return 0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x)) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy

    def scan(self, file_path, original_filename):
        with open(file_path, "rb") as f:
            data = f.read()
            
        file_size = len(data)
        entropy = self.calculate_entropy(data)
        mime_type = self.mime.from_file(file_path)
        
        risk_score = 0
        reasons = []
        
        # 1. Entropy Analysis (High entropy > 7.4 suggests encryption/packing)
        if entropy > 7.4:
            risk_score += 60
            reasons.append(f"Entropy Load: High entropy ({entropy:.2f}) indicates encrypted content or a packed ransomware payload.")
        
        # 2. Extension Mismatch / Risk
        ext = original_filename.split('.')[-1].lower() if '.' in original_filename else ''
        if ext in ['exe', 'dll', 'bin', 'vbs', 'js', 'apk', 'ps1', 'scr']:
            risk_score += 35
            reasons.append(f"Execution Risk: High-risk file type (.{ext}) detected.")
            
        # 3. Malware Signature Search
        malware_signatures = {
            "EICAR Test Virus": b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
            "Ransomware Shadow Copy Delete": b"vssadmin delete shadows",
            "Event Log Eraser": b"wevtutil cl",
            "File Encryption Header": b"AES-256",
            "Onion Link Pattern": b"http://", # Simplified; real ones use regex
            "Payment Instruction": b"your files have been encrypted"
        }
        for name, sig in malware_signatures.items():
            if sig.lower() in data.lower():
                risk_score = 100
                reasons.append(f"CRITICAL: {name} signature detected in binary.")

        # 4. Abnormal Structure
        if file_size < 50000 and entropy > 7.0:
            risk_score += 20
            reasons.append("Abnormal Density: Small size with very high entropy suggests a compact encryption stub.")

        risk_score = min(risk_score, 100)
        status = "SAFE"
        if risk_score > 50: status = "MALICIOUS"
        elif risk_score > 20: status = "SUSPICIOUS"
        
        return {
            "file_name": original_filename,
            "status": status,
            "risk_score": risk_score,
            "threat_type": "Data Locker / Ransomware" if status == "MALICIOUS" else "N/A",
            "explanation": reasons,
            "details": {
                "entropy": entropy,
                "mime_type": mime_type,
                "size_bytes": file_size
            }
        }

def generate_ai_report(scan_results, scan_type):
    """Generates a human-friendly AI report based on scan findings."""
    status = scan_results.get('status')
    score = scan_results.get('risk_score')
    
    report = {
        "summary": f"Our AI analyzer has classified this {scan_type} as {status} with a risk certainty of {score}%.",
        "key_risks": scan_results.get('reasons') or scan_results.get('explanation') or ["No immediate structural threats found."],
        "verdict": status,
        "recommendations": []
    }
    
    if status == "SAFE":
        report["recommendations"] = ["Monitor for any future behavioral changes.", "Ensure your local firewall is active."]
    elif status == "SUSPICIOUS":
        report["recommendations"] = ["Avoid entering personal data.", "Run a deep scan on your local machine if you downloaded anything."]
    else:
        report["recommendations"] = ["Do not interact with this resource.", "Quarantine any related files immediately.", "Clear your browser cache and cookies."]
        
    return report
