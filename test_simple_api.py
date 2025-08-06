import requests

def test_simple_api():
    try:
        # Test the emotion detection endpoint which doesn't require authentication
        response = requests.post("http://127.0.0.1:8050/api/emotions/detect/", 
                               json={"image_data": [255, 255, 255, 255] * 1000,  # Simple test data
                                    "width": 100,
                                    "height": 100})
        print(f"Simple API Test - Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing emotion detection API endpoint...")
    success = test_simple_api()
    print(f"Test {'passed' if success else 'failed'}")
