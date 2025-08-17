from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class CSRFExemptMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Exempt login, signup, and attendance marking endpoints from CSRF
        exempt_paths = [
            '/api/users/login/', 
            '/api/users/signup/',
            '/api/attendance/mark_attendance/'
        ]
        if request.path in exempt_paths:
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
    

