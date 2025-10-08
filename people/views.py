from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Person
from .serializers import PersonSerializer

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    
    @action(detail=False, methods=['get'], url_path='filter_employees')
    def by_department(self, request):
        """
        Filter people by department and/or status
        GET /people/by_department/?department=Engineering
        GET /people/by_department/?status=active
        GET /people/by_department/?department=Engineering&status=active
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
        DELETE /people/delete_by_identifier/?email=john.smith@acdc.com
        DELETE /people/delete_by_identifier/?full_name=John Smith
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
        PATCH /api/employees/update_by_identifier/?email=john.doe@acdc.com
        PATCH /api/employees/update_by_identifier/?full_name=John Doe
        Body: {"department": "Sales", "status": "on_leave"}
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