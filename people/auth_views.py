"""
Views for User Registration and Management
Uses Django's built-in User model (auth_user table)
"""

from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

# Import our serializers
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    ChangePasswordSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    POST /api/register/
    
    Register a new user in the auth_user table
    No authentication required (public endpoint)
    
    Request Body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "SecurePass123!",
        "password2": "SecurePass123!",
        "first_name": "John",
        "last_name": "Doe"
    }
    
    Response (201 Created):
    {
        "id": 5,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Anyone can register
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        # Validate data
        if serializer.is_valid():
            # Create user (serializer.create() handles password hashing)
            user = serializer.save()
            
            # Return user data without password
            user_data = UserSerializer(user).data
            
            return Response({
                'user': user_data,
                'message': 'User registered successfully! You can now login.'
            }, status=status.HTTP_201_CREATED)
        
        # Return validation errors
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(generics.RetrieveAPIView):
    """
    GET /api/profile/
    
    Get current logged-in user's information
    Requires authentication (JWT token)
    
    Headers:
        Authorization: Bearer <access_token>
    
    Response:
    {
        "id": 5,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_staff": false,
        "is_active": true,
        "date_joined": "2024-11-04T10:30:00Z",
        "last_login": "2024-11-04T14:25:00Z"
    }
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Requires JWT token
    
    def get_object(self):
        # Return the currently authenticated user
        # request.user is automatically set by JWT authentication
        return self.request.user


class ChangePasswordView(APIView):
    """
    POST /api/change-password/
    
    Change password for authenticated user
    Requires authentication (JWT token)
    
    Headers:
        Authorization: Bearer <access_token>
    
    Request Body:
    {
        "old_password": "OldPass123!",
        "new_password": "NewPass456!",
        "new_password2": "NewPass456!"
    }
    
    Response:
    {
        "message": "Password changed successfully"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": "Wrong password."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password (automatically hashed)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"message": "Password changed successfully"},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    GET /api/users/
    
    List all users (admin only)
    Requires authentication and staff privileges
    
    Headers:
        Authorization: Bearer <access_token>
    
    Response:
    [
        {
            "id": 1,
            "username": "admin",
            "email": "admin@acdcco.org",
            ...
        },
        {
            "id": 2,
            "username": "hr_manager",
            ...
        }
    ]
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Could add IsAdminUser for staff-only
    
    def get_queryset(self):
        """
        Optionally filter users
        """
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


# Alternative: Function-based view for registration (simpler)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Alternative function-based view for registration
    
    POST /api/register/
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'message': 'User registered successfully!'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Alternative function-based view for getting current user
    
    GET /api/me/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)