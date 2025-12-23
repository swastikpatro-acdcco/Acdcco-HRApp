"""
Custom Permission Classes for Role-Based Access Control (RBAC)

These permission classes enforce the three HR role levels:
1. HR_ReadOnly - Can only view employee data (GET requests)
2. HR_ReadWrite - Can view, create, and update employee data (GET, POST, PATCH)
3. HR_FullAccess - Can perform all operations including delete (GET, POST, PATCH, DELETE)

Usage in views:
    from .permissions import IsReadOnlyOrAbove, IsReadWriteOrAbove, IsFullAccessUser
    
    class PersonViewSet(viewsets.ModelViewSet):
        def get_permissions(self):
            if self.action in ['list', 'retrieve']:
                return [IsReadOnlyOrAbove()]
            elif self.action in ['create', 'update', 'partial_update']:
                return [IsReadWriteOrAbove()]
            elif self.action == 'destroy':
                return [IsFullAccessUser()]
            return [IsAuthenticated()]
"""

from rest_framework import permissions


class IsReadOnlyOrAbove(permissions.BasePermission):
    """
    Permission check for Read-Only access and above.
    
    Allows access if user is in ANY of these groups:
    - HR_ReadOnly
    - HR_ReadWrite
    - HR_FullAccess
    
    Also allows superusers.
    
    Use for: GET requests (list, retrieve)
    """
    
    message = "You need at least Read-Only access to view employee data."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have access
        if request.user.is_superuser:
            return True
        
        # Check if user belongs to any HR role group
        user_groups = request.user.groups.values_list('name', flat=True)
        allowed_groups = ['HR_ReadOnly', 'HR_ReadWrite', 'HR_FullAccess']
        
        return any(group in allowed_groups for group in user_groups)


class IsReadWriteOrAbove(permissions.BasePermission):
    """
    Permission check for Read-Write access and above.
    
    Allows access if user is in ANY of these groups:
    - HR_ReadWrite
    - HR_FullAccess
    
    Denies access for:
    - HR_ReadOnly (they can only view)
    
    Also allows superusers.
    
    Use for: POST, PUT, PATCH requests (create, update)
    """
    
    message = "You need at least Read-Write access to create or modify employee data. Your current role only allows viewing."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have access
        if request.user.is_superuser:
            return True
        
        # Check if user belongs to ReadWrite or FullAccess group
        user_groups = request.user.groups.values_list('name', flat=True)
        allowed_groups = ['HR_ReadWrite', 'HR_FullAccess']
        
        return any(group in allowed_groups for group in user_groups)


class IsFullAccessUser(permissions.BasePermission):
    """
    Permission check for Full Access only.
    
    Allows access if user is in:
    - HR_FullAccess group ONLY
    
    Denies access for:
    - HR_ReadOnly (can only view)
    - HR_ReadWrite (can view, create, update but NOT delete)
    
    Also allows superusers.
    
    Use for: DELETE requests (destroy)
    """
    
    message = "You need Full Access role to delete employee data. Your current role does not allow deletions."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have access
        if request.user.is_superuser:
            return True
        
        # Check if user belongs to FullAccess group
        return request.user.groups.filter(name='HR_FullAccess').exists()


class IsSuperUserOnly(permissions.BasePermission):
    """
    Permission check for Superuser-only operations.
    
    Allows access ONLY to superusers.
    
    Denies access for ALL HR role users:
    - HR_ReadOnly
    - HR_ReadWrite
    - HR_FullAccess
    
    Use for: User management endpoints (register, assign roles, etc.)
    """
    
    message = "Only superusers can perform this action. HR staff cannot manage user accounts or assign roles."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only superusers allowed
        return request.user.is_superuser


class CannotModifySelf(permissions.BasePermission):
    """
    Prevents users from modifying their own role or account privileges.
    
    Use in conjunction with IsSuperUserOnly for role assignment endpoints.
    
    Example:
        permission_classes = [IsSuperUserOnly, CannotModifySelf]
    """
    
    message = "You cannot modify your own role or privileges. Another superuser must make this change."
    
    def has_permission(self, request, view):
        # This check is done at object level
        return True
    
    def has_object_permission(self, request, view, obj):
        # Prevent users from modifying themselves
        # obj should be a User instance
        return obj.id != request.user.id


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_user_role(user):
    """
    Helper function to get a user's role name.
    
    Returns:
        - "Superuser" if user is superuser
        - "HR_ReadOnly", "HR_ReadWrite", or "HR_FullAccess" if user has HR role
        - "No Role" if user has no groups
        - First group name if user has non-HR groups
    """
    if user.is_superuser:
        return "Superuser"
    
    user_groups = user.groups.all()
    
    if not user_groups.exists():
        return "No Role"
    
    # Check for HR roles
    hr_roles = ['HR_ReadOnly', 'HR_ReadWrite', 'HR_FullAccess']
    for group in user_groups:
        if group.name in hr_roles:
            return group.name
    
    # Return first group if no HR role found
    return user_groups.first().name


def user_has_permission_level(user, required_level):
    """
    Helper function to check if user has at least the required permission level.
    
    Args:
        user: Django User object
        required_level: String - "read", "write", or "delete"
    
    Returns:
        Boolean - True if user has required permission level or above
    
    Example:
        if user_has_permission_level(request.user, "write"):
            # User can create/update
    """
    if user.is_superuser:
        return True
    
    user_groups = user.groups.values_list('name', flat=True)
    
    if required_level == "read":
        # Any HR role can read
        return any(group in ['HR_ReadOnly', 'HR_ReadWrite', 'HR_FullAccess'] for group in user_groups)
    
    elif required_level == "write":
        # ReadWrite and FullAccess can write
        return any(group in ['HR_ReadWrite', 'HR_FullAccess'] for group in user_groups)
    
    elif required_level == "delete":
        # Only FullAccess can delete
        return 'HR_FullAccess' in user_groups
    
    return False