import cv2
import time
import sys
import os
import threading


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.recognize_faces import FaceRecognizer, draw_results
from src.utils import load_config, AttendanceManager

# Video stream setup
def _camera_loop(source, name, recognizer: FaceRecognizer, attendance: AttendanceManager):
    print(f"[{name}] Starting camera thread...")
    print(f"[{name}] Source: {source} (type: {type(source).__name__})")
    
    # Helper: try opening the source with several fallbacks/backends
    def _try_open(source_value):
        # If it's an int (webcam index), prefer DirectShow on Windows
        if isinstance(source_value, int):
            try:
                print(f"[{name}] Trying DirectShow backend for webcam index {source_value}")
                cap_local = cv2.VideoCapture(source_value, cv2.CAP_DSHOW)
                if cap_local.isOpened():
                    return cap_local
            except Exception:
                pass
            try:
                print(f"[{name}] Trying default backend for webcam index {source_value}")
                cap_local = cv2.VideoCapture(source_value)
                if cap_local.isOpened():
                    return cap_local
            except Exception:
                pass
            return None

        # For string sources (IP camera / HTTP / RTSP), try a list of fallbacks
        tried = []
        url = str(source_value)

        candidates = [url]
        # If HTTPS, also try HTTP
        if url.startswith('https://'):
            candidates.append('http://' + url[len('https://'):])

        # Try common suffixes for MJPEG streams
        if not any(suffix in url for suffix in ['/video', '/video.mjpg', '/stream', '/mjpeg']):
            candidates.extend([url + '/video', url + '/video.mjpg', url + '/stream', url + '/mjpeg'])

        # Try opening with different backends if available
        backends = [None]
        # cv2.CAP_FFMPEG may be available in some builds
        if hasattr(cv2, 'CAP_FFMPEG'):
            backends.append(cv2.CAP_FFMPEG)
        # cv2.CAP_ANY lets OpenCV choose
        if hasattr(cv2, 'CAP_ANY'):
            backends.append(cv2.CAP_ANY)

        for candidate in candidates:
            for backend in backends:
                try:
                    if backend is None:
                        print(f"[{name}] Trying default backend for URL: {candidate}")
                        cap_local = cv2.VideoCapture(candidate)
                    else:
                        print(f"[{name}] Trying backend {backend} for URL: {candidate}")
                        cap_local = cv2.VideoCapture(candidate, backend)

                    if cap_local is not None and cap_local.isOpened():
                        print(f"[{name}] Opened video source with candidate: {candidate} (backend={backend})")
                        return cap_local
                    else:
                        tried.append((candidate, backend))
                        # release if created
                        try:
                            cap_local.release()
                        except Exception:
                            pass
                except Exception as e:
                    tried.append((candidate, backend, str(e)))
                    continue

        print(f"[{name}] Tried candidates: {tried}")
        return None

    cap = _try_open(source)
    if not cap or not cap.isOpened():
        print(f"[{name}] ERROR: Could not open video source! (all fallbacks failed)")
        return
    
    print(f"[{name}] Camera opened successfully")
    
    # Set camera properties for better performance (only meaningful for local webcams)
    if isinstance(source, int):
        try:
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            # Not all OpenCV builds support CAP_PROP_BUFFERSIZE; ignore failures
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass
    
    prev_time = time.time()
    window_name = f"Face Recognition - {name}"
    print(f"[{name}] Window name: '{window_name}'")
    
    # Create window
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 640, 480)

    frame_count = 0
    skip_frames = 2 if isinstance(source, int) else 0  # Skip frames for webcam to improve FPS
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print(f"[{name}] Can't receive frame (stream end?). Exiting...")
            break
        
        frame_count += 1
        if frame_count == 1:
            print(f"[{name}] Successfully reading frames (shape: {frame.shape})")
        
        # Skip frames for webcam to improve performance
        if skip_frames > 0 and frame_count % (skip_frames + 1) != 0:
            continue

        # Mirror webcam feed for natural view
        if isinstance(source, int):
            frame = cv2.flip(frame, 1)

        # Recognition (process every frame for accuracy)
        results = recognizer.recognize_face(frame)

        # Attendance marking
        for r in results:
            label = r.get('label', 'Unknown')
            if attendance.should_mark(label):
                attendance.mark(label, name)
                print(f"{label} is present (camera: {name})")

        # Draw bounding boxes and labels
        annotated = draw_results(frame, results)

        # Calculate and display FPS
        curr_time = time.time()
        fps = 1.0 / max(curr_time - prev_time, 1e-6)
        prev_time = curr_time
        
        # FPS text with background for better visibility
        text = f"FPS: {fps:.1f}"
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
        cv2.rectangle(annotated, (5, 5), (15 + text_size[0], 40), (0, 0, 0), -1)
        cv2.putText(annotated, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        # Display camera name
        cv2.putText(annotated, name, (10, annotated.shape[0] - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Show frame
        cv2.imshow(window_name, annotated)

        # Exit on 'q' key
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print(f"[{name}] Quit requested by user")
            break

    cap.release()
    try:
        cv2.destroyWindow(window_name)
    except:
        pass  # Window may not exist if camera failed early


def run_video_stream():

    config = load_config()
    try:
        recognizer = FaceRecognizer()
    except Exception as e:
        print(f"Initialization error: {e}")
        print("ACTION REQUIRED: Ensure 'dataset' is populated and 'src/precompute_embeddings.py' has been run successfully.")
        return

    
    att_cfg = config.get('ATTENDANCE', {}) if config else {}
    attendance = AttendanceManager(
        cooldown_hours=int(att_cfg.get('COOLDOWN_HOURS', 4)),
        log_file=att_cfg.get('LOG_FILE', None)
    )

    sources = config.get('CAMERA_SOURCES', []) if config else []
    if not sources:
        sources = [{ 'name': 'Webcam-0', 'source': 0 }]

    print(f"\n{'='*60}")
    print(f"Camera Sources: {len(sources)}")
    for i, cam in enumerate(sources):
        print(f"   {i+1}. {cam.get('name')} -> {cam.get('source')}")
    print(f"{'='*60}")
    print("Starting video streams... Press 'q' in any window to exit.\n")
    
    threads = []
    for i, cam in enumerate(sources):
        name = str(cam.get('name', cam.get('source', 'camera')))
        src = cam.get('source', 0)
        t = threading.Thread(target=_camera_loop, args=(src, name, recognizer, attendance), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(0.3)  # Small delay between starting threads

    
    try:
        while any(t.is_alive() for t in threads):
            time.sleep(0.2)
    finally:
        cv2.destroyAllWindows()
        print("Video streams closed.")


if __name__ == "__main__":
    run_video_stream()