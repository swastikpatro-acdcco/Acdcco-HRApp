from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

# ============================================================================
# NEW SERIALIZERS - Serializers for user authentication
# ============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Uses existing auth_user table in Supabase
    """
    # Extra fields not in User model but needed for registration
    password = serializers.CharField(
        write_only=True,  # Don't return password in response
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]  # Use Django's password validators
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirm Password",
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name'
        ]
        extra_kwargs = {
            'email': {'required': True},  # Make email required
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
        # Don't return password in responses
        read_only_fields = ['id']
    
    def validate_email(self, value):
        """
        Check that email is unique
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """
        Check that username is unique and valid
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        # Additional validation: no spaces, minimum length
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        return value
    
    def validate(self, attrs):
        """
        Check that passwords match
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password2": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """
        Create new user in auth_user table
        """
        # Remove password2 as it's not part of User model
        validated_data.pop('password2')
        
        # Create user using Django's create_user method
        # This automatically hashes the password!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],  # Will be hashed
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for returning user information (without password)
    Used for profile views and user listings
    """
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login'
        ]
        read_only_fields = fields  # All fields read-only for GET requests


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Check that new passwords match"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password2": "New password fields didn't match."
            })
        return attrs
