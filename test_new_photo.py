import requests
import numpy as np
import cv2

def test_new_photo_emotion_detection():
    # Load the new photo with the smiling face
    photo_path = "WIN_20250806_19_48_26_Pro.jpg"
    
    try:
        # Read the image using OpenCV
        image = cv2.imread(photo_path)
        if image is None:
            print(f"Error: Could not load image from {photo_path}")
            return False
            
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize to a reasonable size for processing
        height, width = image_rgb.shape[:2]
        if width > 640:
            scale = 640 / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            image_rgb = cv2.resize(image_rgb, (new_width, new_height))
            height, width = image_rgb.shape[:2]
        
        print(f"Image dimensions: {width}x{height}")
        
        # Convert to RGBA format (add alpha channel)
        image_rgba = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2RGBA)
        
        # Flatten the image data
        image_data = image_rgba.flatten().tolist()
        
        print(f"Image data length: {len(image_data)}")
        print(f"Expected length: {width * height * 4}")
        
        # Test the emotion detection API
        url = "http://localhost:8050/api/emotions/detect/"
        
        data = {
            "image_data": image_data,
            "width": width,
            "height": height
        }
        
        print("Sending request to emotion detection API...")
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Emotion Detection Result: {result}")
            return True
        else:
            print(f"Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing emotion detection on new photo (smiling face)...")
    success = test_new_photo_emotion_detection()
    print(f"Test {'passed' if success else 'failed'}")
