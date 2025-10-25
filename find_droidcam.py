"""
DroidCam Connection Tester
Tests multiple IP addresses to find working DroidCam instances
"""
import socket
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_droidcam_ip(ip, port=4343):
    """Test if DroidCam is accessible at given IP"""
    try:
        # First check if port is open (faster)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((ip, port))
        sock.close()
        
        if result == 0:
            # Port is open, now try HTTP request
            url = f"http://{ip}:{port}/video"
            response = requests.get(url, timeout=2, stream=True)
            if response.status_code == 200:
                return True, url
        return False, None
    except:
        return False, None

def scan_network(base_ip="192.168.137", start=1, end=255):
    """Scan network for DroidCam instances"""
    print(f"🔍 Scanning {base_ip}.{start}-{end} for DroidCam instances...")
    print(f"This may take 1-2 minutes...\n")
    
    found_cameras = []
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {}
        for i in range(start, end + 1):
            ip = f"{base_ip}.{i}"
            futures[executor.submit(test_droidcam_ip, ip)] = ip
        
        completed = 0
        for future in as_completed(futures):
            completed += 1
            if completed % 20 == 0:
                print(f"Progress: {completed}/{end-start+1} tested...")
            
            ip = futures[future]
            try:
                success, url = future.result()
                if success:
                    found_cameras.append((ip, url))
                    print(f"✅ FOUND: {url}")
            except:
                pass
    
    return found_cameras

if __name__ == "__main__":
    print("="*60)
    print("DroidCam Network Scanner")
    print("="*60)
    
    # Test known IPs first
    print("\n📱 Testing known IP addresses from config.yaml...")
    test_ips = [
        "192.168.137.225",
        "192.168.137.186"
    ]
    
    found = []
    for ip in test_ips:
        print(f"Testing {ip}...", end=" ")
        success, url = test_droidcam_ip(ip)
        if success:
            print(f"✅ WORKING: {url}")
            found.append((ip, url))
        else:
            print(f"❌ Not responding")
    
    if not found:
        print("\n⚠️ Known IPs not working. Starting network scan...")
        print("(This will scan all devices on your network)")
        print()
        
        response = input("Scan network? (y/n): ")
        if response.lower() == 'y':
            found = scan_network()
    
    # Summary
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    
    if found:
        print(f"\n✅ Found {len(found)} DroidCam camera(s):\n")
        for ip, url in found:
            print(f"  IP: {ip}")
            print(f"  URL: {url}")
            print()
        
        print("\n📝 Use these in config.yaml:")
        print("-"*60)
        for i, (ip, url) in enumerate(found, 1):
            print(f"  - name: DroidCam-Phone-{i}")
            print(f"    source: {url}")
    else:
        print("\n❌ No DroidCam cameras found!")
        print("\n💡 Troubleshooting tips:")
        print("  1. Make sure DroidCam app is RUNNING on your phone")
        print("  2. Check that phone and laptop are on SAME WiFi network")
        print("  3. Look at the IP address shown in the DroidCam app")
        print("  4. Try accessing http://THAT_IP:4343/video in Chrome")
        print("  5. Check Windows Firewall isn't blocking the connection")
