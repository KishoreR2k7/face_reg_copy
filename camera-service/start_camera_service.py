#!/usr/bin/env python3
"""
Camera Service Startup Script
"""

import subprocess
import sys
import os

def main():
    """Start the camera service"""
    print("=" * 60)
    print("   BACKGROUND CAMERA SERVICE")
    print("=" * 60)
    print("Starting face recognition cameras...")
    print("Press Ctrl+C to stop")
    print()
    
    # Change to camera-service directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        # Run the camera service
        subprocess.run([sys.executable, "camera_service.py"], check=True)
    except KeyboardInterrupt:
        print("\nCamera service stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Camera service failed with error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
