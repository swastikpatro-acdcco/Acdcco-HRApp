"""
URL Configuration for Authentication Endpoints

Add these to your main urls.py:
    from django.urls import path, include
    
    urlpatterns = [
        ...
        path('api/', include('people.auth_urls')),  # If putting in people app
    ]
"""

from django.urls import path
from . import auth_views

# Using class-based views
urlpatterns = [
    # User Registration
    path('register/', auth_views.UserRegistrationView.as_view(), name='register'),
    
    # User Profile
    path('profile/', auth_views.UserProfileView.as_view(), name='profile'),
    path('me/', auth_views.get_current_user, name='current-user'),  # Alternative endpoint
    
    # Password Management
    path('change-password/', auth_views.ChangePasswordView.as_view(), name='change-password'),
    
    # User List (admin)
    path('users/', auth_views.UserListView.as_view(), name='user-list'),
]

"""
Available Endpoints:

PUBLIC (No authentication required):
  POST   /api/register/           - Register new user

PROTECTED (Requires JWT token):
  GET    /api/profile/            - Get current user info
  GET    /api/me/                 - Get current user info (alternative)
  POST   /api/change-password/    - Change password
  GET    /api/users/              - List all users (staff only)
  
JWT Token Endpoints (from djangorestframework-simplejwt):
  POST   /api/token/              - Login (get access & refresh tokens)
  POST   /api/token/refresh/      - Refresh access token
  POST   /api/token/blacklist/    - Logout (blacklist refresh token)
"""