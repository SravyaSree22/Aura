import requests
import numpy as np
import json

def test_emotion_detection_with_auth():
    # First, get CSRF token
    session = requests.Session()
    
    try:
        # Get CSRF token
        csrf_response = session.get("http://127.0.0.1:8050/api/users/csrf_token/")
        print(f"CSRF Status: {csrf_response.status_code}")
        
        if csrf_response.status_code == 200:
            csrf_data = csrf_response.json()
            csrf_token = csrf_data.get('csrfToken', '')
            print(f"CSRF Token: {csrf_token[:20]}...")
            
            # Set CSRF token in session
            session.headers.update({
                'X-CSRFToken': csrf_token,
                'Content-Type': 'application/json'
            })
            
            # Create a simple test image (random data)
            width, height = 640, 480
            test_image_data = np.random.randint(0, 255, (height, width, 4), dtype=np.uint8).flatten().tolist()
            
            # Test data
            data = {
                "image_data": test_image_data,
                "width": width,
                "height": height
            }
            
            # Test emotion detection
            response = session.post("http://127.0.0.1:8050/api/emotions/detect/", json=data)
            print(f"Emotion Detection Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Emotion Detection Response: {result}")
                return True
            else:
                print(f"Error Response: {response.text}")
                return False
        else:
            print(f"Failed to get CSRF token: {csrf_response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing emotion detection API with authentication...")
    success = test_emotion_detection_with_auth()
    print(f"Test {'passed' if success else 'failed'}")
