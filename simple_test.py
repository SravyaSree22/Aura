import requests

try:
    # Create a session to maintain authentication
    session = requests.Session()
    
    # Test CSRF token endpoint
    response = session.get('http://localhost:8050/api/users/csrf_token/')
    print(f"CSRF Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ CSRF token endpoint is working")
        
        # Login first
        csrf_data = response.json()
        csrf_token = csrf_data.get('csrfToken', '')
        
        login_data = {
            "email": "test2@test.com",
            "password": "testpass123"
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        
        login_response = session.post('http://localhost:8050/api/users/login/', json=login_data, headers=headers)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            
            # Get fresh CSRF token after login
            csrf_response = session.get('http://localhost:8050/api/users/csrf_token/')
            if csrf_response.status_code == 200:
                csrf_data = csrf_response.json()
                csrf_token = csrf_data.get('csrfToken', '')
                print(f"Fresh CSRF token: {csrf_token[:10]}...")
            
            # Test profile picture upload
            with open('test_image.png', 'wb') as f:
                f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\xd7\xd4\xc2\x00\x00\x00\x00IEND\xaeB`\x82')
            
            with open('test_image.png', 'rb') as f:
                files = {"profile_picture": ("test_image.png", f, "image/png")}
                upload_headers = {'X-CSRFToken': csrf_token}
                upload_response = session.post('http://localhost:8050/api/profiles/upload_profile_picture/', files=files, headers=upload_headers)
                print(f"Upload Status: {upload_response.status_code}")
                print(f"Upload Response: {upload_response.text}")
        else:
            print("❌ Login failed")
    else:
        print("❌ CSRF token endpoint is not working")
        
except Exception as e:
    print(f"❌ Error: {e}")
