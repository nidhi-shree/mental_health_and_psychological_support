import cv2
import numpy as np
import tensorflow as tf
import os

class EmotionDetector:
    def __init__(self):
        # 1. Get the absolute path to the 'utils' folder
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        model_path = os.path.join(current_dir, "raf_db_balanced.keras")
        cascade_path = os.path.join(current_dir, "haarcascade_frontalface_default.xml")

        print(f"Loading Model from: {model_path}")
        
        # 2. Load Model
        try:
            self.model = tf.keras.models.load_model(model_path)
            print("✅ Emotion Model Loaded!")
        except OSError:
            print("❌ ERROR: Could not find 'raf_db_balanced.keras'. Check utils folder.")

        # 3. Load Face Detector
        try:
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            if self.face_cascade.empty():
                raise IOError("Failed to load Haarcascade xml")
            print("✅ Face Detector Loaded!")
        except Exception:
            print("⚠️ Local XML not found, trying system OpenCV data...")
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

        self.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    def detect(self, image_file):
        """Detect emotion from an uploaded image file (Snapshot)"""
        nparr = np.frombuffer(image_file.read(), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return self._predict_frame(frame)

    def process_video(self, video_path):
        """Analyzes a video file frame-by-frame (1 FPS) with safety checks"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print("❌ Error: Could not open video file.")
            return []

        # 1. Get FPS with fallback
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # WebM files often return 0 or crazy numbers for FPS. Fix it.
        if fps <= 0 or fps > 120:
            print(f"⚠️ Warning: Abnormal FPS detected ({fps}). Forcing to 30.")
            fps = 30
            
        frame_interval = int(fps) # Process 1 frame every second
        if frame_interval == 0: frame_interval = 30 # Double safety
        
        print(f"🎬 Video Info: FPS={fps}, Total Frames={total_frames}, Interval={frame_interval}")
        
        timeline = []
        frame_count = 0
        analyzed_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break # End of video
            
            # Analyze 1 frame per second
            if frame_count % frame_interval == 0:
                result = self._predict_frame(frame)
                timestamp = frame_count / fps
                
                # If face found, add to timeline
                if result:
                    timeline.append({
                        "time": round(timestamp, 1),
                        "emotion": result['emotion'],
                        "confidence": float(f"{result['confidence']:.2f}")
                    })
                    analyzed_count += 1
                else:
                    # Optional: Log 'Neutral' or 'Unknown' if face lost for a second
                    # This keeps the graph continuous even if user turns away
                    pass 
            
            frame_count += 1
            
        cap.release()
        print(f"✅ Analysis Complete: Processed {analyzed_count} seconds of video.")
        return timeline
    def _predict_frame(self, frame):
        """Internal helper to detect face and predict emotion on a numpy frame"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        if len(faces) == 0:
            return None

        # Sort to get the largest face
        faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
        x, y, w, h = faces[0]
        face_roi = frame[y:y+h, x:x+w]

        rgb_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb_face, (224, 224))
        input_data = np.expand_dims(resized, axis=0)

        preds = self.model.predict(input_data, verbose=0)
        label_idx = np.argmax(preds)
        confidence = float(np.max(preds))

        return {
            "emotion": self.emotions[label_idx],
            "confidence": confidence,
            "mapped_mood": self.map_emotion_to_score(self.emotions[label_idx])
        }

    def map_emotion_to_score(self, emotion):
        mapping = {
            'Happy': 5, 'Surprise': 4, 'Neutral': 3, 
            'Sad': 2, 'Fear': 2, 'Angry': 1, 'Disgust': 1
        }
        return mapping.get(emotion, 3)

# Initialize
detector = EmotionDetector()