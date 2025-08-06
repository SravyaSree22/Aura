import requests
import json

def test_frontend_backend_connection():
    """Test if the frontend can connect to the backend"""
    
    # Test 1: Simple connection test
    try:
        response = requests.get('http://localhost:8050/api/emotions/')
        print(f"GET /api/emotions/ - Status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Backend is running and responding (authentication required as expected)")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False
    
    # Test 2: Emotion detection test
    try:
        # Create a simple test image
        width, height = 640, 480
        test_image_data = [128] * (width * height * 4)  # Gray image
        
        response = requests.post('http://localhost:8050/api/emotions/detect/', 
                               json={
                                   'image_data': test_image_data,
                                   'width': width,
                                   'height': height
                               })
        
        print(f"POST /api/emotions/detect/ - Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Emotion detection working: {result['emotion']} ({result['confidence']:.2f})")
            return True
        else:
            print(f"❌ Emotion detection failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Emotion detection test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing frontend-backend connection...")
    success = test_frontend_backend_connection()
    print(f"Test {'passed' if success else 'failed'}")
