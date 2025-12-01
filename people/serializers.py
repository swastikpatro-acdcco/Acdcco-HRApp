from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

# ============================================================================
# USER AUTHENTICATION SERIALIZERS WITH RBAC
# ============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with RBAC role assignment
    Uses existing auth_user table and assigns user to HR role group
    
    SECURITY: Only superusers can call this endpoint (enforced in view)
    """
    # Extra fields not in User model but needed for registration
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirm Password",
        style={'input_type': 'password'}
    )
    
    # NEW: Role field for RBAC
    role = serializers.ChoiceField(
        choices=[
            ('HR_ReadOnly', 'HR Read Only - Can only view employee data'),
            ('HR_ReadWrite', 'HR Read Write - Can view, create, and update employee data'),
            ('HR_FullAccess', 'HR Full Access - Can perform all operations including delete')
        ],
        required=True,
        help_text="Assign a role to this user. Role determines their permissions in the system."
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
            'last_name',
            'role'  # NEW: Include role field
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
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
    
    def validate_role(self, value):
        """
        Validate that the role group exists in the database
        """
        try:
            Group.objects.get(name=value)
        except Group.DoesNotExist:
            raise serializers.ValidationError(
                f"Role '{value}' does not exist. Please run 'python manage.py create_hr_groups' first."
            )
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
        Create new user in auth_user table and assign to role group
        
        Steps:
        1. Extract role from validated data
        2. Create user account
        3. Assign user to the specified role group
        4. Return user object
        """
        # Extract role before creating user (not part of User model)
        role_name = validated_data.pop('role')
        
        # Remove password2 as it's not part of User model
        validated_data.pop('password2')
        
        # Create user using Django's create_user method
        # This automatically hashes the password!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Assign user to the specified role group
        # This creates a row in auth_user_groups table
        try:
            role_group = Group.objects.get(name=role_name)
            user.groups.add(role_group)
            
            # Log the assignment (optional but useful for debugging)
            print(f"✓ User '{user.username}' assigned to role '{role_name}'")
            
        except Group.DoesNotExist:
            # This shouldn't happen due to validate_role(), but handle it anyway
            user.delete()  # Rollback user creation
            raise serializers.ValidationError(
                f"Failed to assign role '{role_name}'. Role group does not exist."
            )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for returning user information (without password)
    Used for profile views and user listings
    
    ENHANCED: Now includes role information
    """
    # NEW: Add role field to show user's assigned role
    role = serializers.SerializerMethodField()
    
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
            'last_login',
            'role'  # NEW: Include role in response
        ]
        read_only_fields = fields
    
    def get_role(self, obj):
        """
        Get the user's role from their group membership
        
        Returns:
        - Role name (e.g., "HR_ReadWrite") if user is in an HR role group
        - "No Role Assigned" if user has no groups
        - "Superuser" if user is a superuser
        - First group name if user has multiple groups
        """
        # Check if superuser
        if obj.is_superuser:
            return "Superuser"
        
        # Get user's groups
        user_groups = obj.groups.all()
        
        if not user_groups.exists():
            return "No Role Assigned"
        
        # Get first HR role (users should only have one HR role)
        hr_roles = ['HR_ReadOnly', 'HR_ReadWrite', 'HR_FullAccess']
        for group in user_groups:
            if group.name in hr_roles:
                return group.name
        
        # If no HR role found, return first group name
        return user_groups.first().name


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