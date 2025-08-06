import requests
import numpy as np
import json

# Test the emotion detection endpoint
def test_emotion_detection():
    # Create a simple test image (random data)
    width, height = 640, 480
    test_image_data = np.random.randint(0, 255, (height, width, 4), dtype=np.uint8).flatten().tolist()
    
    url = "http://127.0.0.1:8050/api/emotions/detect/"
    
    # Test data
    data = {
        "image_data": test_image_data,
        "width": width,
        "height": height
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing emotion detection API...")
    success = test_emotion_detection()
    print(f"Test {'passed' if success else 'failed'}")
