"""
URL Configuration for Authentication Endpoints

SECURITY CONFIGURATION:
- Registration: PROTECTED - Only superusers can register new users
- Profile: PROTECTED - Authenticated users can view own profile
- Change Password: PROTECTED - Authenticated users can change own password
- User List: PROTECTED - Only superusers can list all users

Add these to your main urls.py:
    from django.urls import path, include
    
    urlpatterns = [
        ...
        path('api/', include('people.auth_urls')),
    ]
"""

from django.urls import path
from . import auth_views

# Using class-based views
urlpatterns = [
    # User Registration (SUPERUSER ONLY)
    path('register/', auth_views.UserRegistrationView.as_view(), name='register'),
    
    # User Profile (AUTHENTICATED ONLY)
    path('profile/', auth_views.UserProfileView.as_view(), name='profile'),
    path('me/', auth_views.get_current_user, name='current-user'),
    
    # Password Management (AUTHENTICATED ONLY)
    path('change-password/', auth_views.ChangePasswordView.as_view(), name='change-password'),
    
    # User List (SUPERUSER ONLY)
    path('users/', auth_views.UserListView.as_view(), name='user-list'),
]

"""
Available Endpoints:

PUBLIC (No authentication required):
  POST   /api/token/              - Login (get access & refresh tokens)
  POST   /api/token/refresh/      - Refresh access token  
  POST   /api/token/blacklist/    - Logout (blacklist refresh token)

PROTECTED - SUPERUSER ONLY (Requires JWT token + superuser privileges):
  POST   /api/register/           - Register new user
  GET    /api/users/              - List all users

PROTECTED - AUTHENTICATED (Requires JWT token):
  GET    /api/profile/            - Get current user info
  GET    /api/me/                 - Get current user info (alternative)
  POST   /api/change-password/    - Change own password

Error Responses:
  401 Unauthorized - No token or invalid token
  403 Forbidden - Valid token but insufficient permissions (not superuser)
  400 Bad Request - Validation errors
"""