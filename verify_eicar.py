import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from scanner_utils import URLScanner

def test_eicar():
    scanner = URLScanner()
    url = "http://malware.wicar.org/data/eicar.com"
    print(f"Scanning target: {url}")
    result = scanner.scan(url)
    print("\nScan Results:")
    print(f"Status: {result['status']}")
    print(f"Risk Score: {result['risk_score']}%")
    print("\nReasons:")
    for r in result['reasons']:
        print(f"- {r}")
    
    if result['status'] == 'MALICIOUS' and result['risk_score'] >= 80:
        print("\nSUCCESS: EICAR detected accurately.")
    else:
        print("\nFAILURE: Detection score too low.")

if __name__ == "__main__":
    test_eicar()
