"""
Test camera connections
"""
import cv2
import yaml

def test_camera(name, source):
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"Source: {source}")
    print(f"{'='*60}")
    
    try:
        # DroidCam typically uses HTTP (not HTTPS) unless you configured SSL
        # Try both HTTP and HTTPS
        test_sources = []
        
        if isinstance(source, str) and source.startswith('https://'):
            # Try HTTP version first
            http_version = source.replace('https://', 'http://')
            test_sources.append(('HTTP version', http_version))
            test_sources.append(('HTTPS version', source))
        else:
            test_sources.append(('Original', source))
        
        for desc, test_source in test_sources:
            print(f"\nTrying {desc}: {test_source}")
            
            if isinstance(test_source, int):
                cap = cv2.VideoCapture(test_source, cv2.CAP_DSHOW)
            else:
                cap = cv2.VideoCapture(test_source)
            
            if cap.isOpened():
                print(f"✅ Camera opened successfully!")
                ret, frame = cap.read()
                if ret:
                    print(f"✅ Frame read successfully! Shape: {frame.shape}")
                    cap.release()
                    return True, test_source
                else:
                    print(f"❌ Could not read frame")
            else:
                print(f"❌ Could not open camera")
            
            cap.release()
        
        return False, source
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, source

if __name__ == "__main__":
    # Load config
    with open('config.yaml', 'r') as f:
        config = yaml.safe_load(f)
    
    cameras = config.get('CAMERA_SOURCES', [])
    
    print("\n" + "="*60)
    print("CAMERA CONNECTION TEST")
    print("="*60)
    
    results = []
    working_sources = []
    
    for cam in cameras:
        name = cam.get('name', 'Unknown')
        source = cam.get('source')
        success, working_source = test_camera(name, source)
        results.append((name, source, success))
        
        if success and working_source != source:
            working_sources.append({
                'name': name,
                'source': working_source
            })
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    for name, source, success in results:
        status = "✅ WORKING" if success else "❌ FAILED"
        print(f"{status} - {name}: {source}")
    
    # Suggestions
    if working_sources:
        print(f"\n{'='*60}")
        print("SUGGESTED FIXES FOR config.yaml:")
        print(f"{'='*60}")
        for cam in working_sources:
            print(f"  - name: {cam['name']}")
            print(f"    source: {cam['source']}")
