from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Person
from .serializers import PersonSerializer

class PersonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Person (Employee) records
    
    SECURITY: All endpoints require JWT authentication
    
    Standard endpoints:
    - GET    /api/employees/           - List all employees
    - POST   /api/employees/           - Create new employee
    - GET    /api/employees/{id}/      - Get employee by ID
    - PUT    /api/employees/{id}/      - Update employee (full)
    - PATCH  /api/employees/{id}/      - Update employee (partial)
    - DELETE /api/employees/{id}/      - Delete employee by ID
    
    Custom endpoints:
    - GET    /api/employees/filter_employees/  - Filter by department/status
    - DELETE /api/employees/delete_by_identifier/  - Delete by email or name
    - PATCH  /api/employees/update_by_identifier/  - Update by email or name
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticated]  # SECURED: Requires JWT authentication
    
    @action(detail=False, methods=['get'], url_path='filter_employees')
    def by_department(self, request):
        """
        Filter people by department and/or status
        
        SECURITY: Requires authentication (inherits from ViewSet)
        
        Examples:
        GET /api/employees/filter_employees/?department=Engineering
        GET /api/employees/filter_employees/?status=active
        GET /api/employees/filter_employees/?department=Engineering&status=active
        
        Headers:
            Authorization: Bearer <access_token>
        """
        department = request.query_params.get('department')
        status_filter = request.query_params.get('status')
        
        # Start with all people
        employees = Person.objects.all()
        
        # Apply filters if provided
        if department:
            employees = employees.filter(department=department)
        
        if status_filter:
            employees = employees.filter(status=status_filter)
        
        # If no filters provided, return empty or all based on your preference
        if not department and not status_filter:
            return Response(
                {"error": "Please provide at least one filter: department or status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def delete_by_identifier(self, request):
        """
        Delete a person by their ACDC email OR full name
        
        SECURITY: Requires authentication (inherits from ViewSet)
        Note: Later will be restricted to Head HR only via RBAC
        
        Examples:
        DELETE /api/employees/delete_by_identifier/?email=john.smith@acdc.com
        DELETE /api/employees/delete_by_identifier/?full_name=John Smith
        
        Headers:
            Authorization: Bearer <access_token>
        """
        email = request.query_params.get('email')
        full_name = request.query_params.get('full_name')
        
        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prefer email if both are provided (more reliable identifier)
        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            person.delete()
            return Response(
                {"message": f"Employee with email {email} deleted successfully"},
                status=status.HTTP_200_OK
            )
        
        # Search by full name
        if full_name:
            # Case-insensitive search
            matching_people = Person.objects.filter(full_name__iexact=full_name)
            
            if matching_people.count() == 0:
                return Response(
                    {"error": f"No employee found with name '{full_name}'"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if matching_people.count() > 1:
                # Multiple matches found - return them so HR can use email instead
                matches = [
                    {
                        "full_name": p.full_name,
                        "email": p.acdc_email,
                        "department": p.department,
                        "position": p.position
                    }
                    for p in matching_people
                ]
                return Response(
                    {
                        "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                        "matches": matches
                    },
                    status=status.HTTP_409_CONFLICT
                )
            
            # Exactly one match - safe to delete
            person = matching_people.first()
            deleted_name = person.full_name
            deleted_email = person.acdc_email
            person.delete()
            
            return Response(
                {"message": f"Employee {deleted_name} ({deleted_email}) deleted successfully"},
                status=status.HTTP_200_OK
            )
        

    @action(detail=False, methods=['patch'])
    def update_by_identifier(self, request):
        """
        Update a person by their ACDC email OR full name
        
        SECURITY: Requires authentication (inherits from ViewSet)
        Note: Later will be restricted to Head HR and Read-Write via RBAC
        
        Examples:
        PATCH /api/employees/update_by_identifier/?email=john.doe@acdc.com
        PATCH /api/employees/update_by_identifier/?full_name=John Doe
        Body: {"department": "Sales", "status": "on_leave"}
        
        Headers:
            Authorization: Bearer <access_token>
        """
        email = request.query_params.get('email')
        full_name = request.query_params.get('full_name')
        
        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prefer email if both provided
        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            
            serializer = self.get_serializer(person, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": f"Employee {email} updated successfully",
                    "updated_data": serializer.data
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update by full name
        if full_name:
            matching_people = Person.objects.filter(full_name__iexact=full_name)
            
            if matching_people.count() == 0:
                return Response(
                    {"error": f"No employee found with name '{full_name}'"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if matching_people.count() > 1:
                matches = [
                    {
                        "full_name": p.full_name,
                        "email": p.acdc_email,
                        "department": p.department,
                        "position": p.position
                    }
                    for p in matching_people
                ]
                return Response(
                    {
                        "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                        "matches": matches
                    },
                    status=status.HTTP_409_CONFLICT
                )
            
            person = matching_people.first()
            serializer = self.get_serializer(person, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": f"Employee {full_name} updated successfully",
                    "updated_data": serializer.data
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)