from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Person
from .serializers import PersonSerializer


class PersonViewSet(viewsets.ModelViewSet):
    """
    Default CRUD:
      GET    /api/people/
      POST   /api/people/
      GET    /api/people/<id>/
      PUT    /api/people/<id>/
      PATCH  /api/people/<id>/
      DELETE /api/people/<id>/
    Custom:
      GET    /api/people/filter_employees/
      PATCH  /api/people/update_by_identifier/
      DELETE /api/people/delete_by_identifier/
      GET    /api/people/human_resources/
      PATCH  /api/people/<id>/set_portal_account/
    """
    queryset = Person.objects.all().order_by("-created_at")
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "full_name",
        "department",
        "subteam",
        "position",
        "status",
        "acdc_email",
        "personal_email",
    ]
    ordering_fields = ["full_name", "start_date", "department", "position", "created_at"]

    # ---------------------------------------------------------------------
    # Filter by department and/or status
    # ---------------------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="filter_employees")
    def by_department(self, request):
        department = request.query_params.get("department")
        status_filter = request.query_params.get("status")

        employees = Person.objects.all()
        if department:
            employees = employees.filter(department=department)
        if status_filter:
            employees = employees.filter(status=status_filter)

        if not department and not status_filter:
            return Response(
                {"error": "Please provide at least one filter: department or status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)

    # ---------------------------------------------------------------------
    # Delete by identifier (ACDC email or full name)
    # ---------------------------------------------------------------------
    @action(detail=False, methods=["delete"], url_path="delete_by_identifier")
    def delete_by_identifier(self, request):
        email = request.query_params.get("email")
        full_name = request.query_params.get("full_name")

        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            person.delete()
            return Response(
                {"message": f"Employee with email {email} deleted successfully"},
                status=status.HTTP_200_OK,
            )

        matching_people = Person.objects.filter(full_name__iexact=full_name)
        if not matching_people.exists():
            return Response(
                {"error": f"No employee found with name '{full_name}'"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if matching_people.count() > 1:
            matches = [
                {
                    "full_name": p.full_name,
                    "email": p.acdc_email,
                    "department": p.department,
                    "position": p.position,
                }
                for p in matching_people
            ]
            return Response(
                {
                    "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                    "matches": matches,
                },
                status=status.HTTP_409_CONFLICT,
            )

        person = matching_people.first()
        deleted_name = person.full_name
        deleted_email = person.acdc_email
        person.delete()

        return Response(
            {"message": f"Employee {deleted_name} ({deleted_email}) deleted successfully"},
            status=status.HTTP_200_OK,
        )

    # ---------------------------------------------------------------------
    # Update by identifier (ACDC email or full name)
    # ---------------------------------------------------------------------
    @action(detail=False, methods=["patch"], url_path="update_by_identifier")
    def update_by_identifier(self, request):
        email = request.query_params.get("email")
        full_name = request.query_params.get("full_name")

        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            serializer = self.get_serializer(person, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "message": f"Employee {email} updated successfully",
                        "updated_data": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        matching_people = Person.objects.filter(full_name__iexact=full_name)
        if not matching_people.exists():
            return Response(
                {"error": f"No employee found with name '{full_name}'"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if matching_people.count() > 1:
            matches = [
                {
                    "full_name": p.full_name,
                    "email": p.acdc_email,
                    "department": p.department,
                    "position": p.position,
                }
                for p in matching_people
            ]
            return Response(
                {
                    "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                    "matches": matches,
                },
                status=status.HTTP_409_CONFLICT,
            )

        person = matching_people.first()
        serializer = self.get_serializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"Employee {full_name} updated successfully",
                    "updated_data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------------------
    # NEW: list only Human Resources people
    # ---------------------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="human_resources")
    def human_resources(self, request):
        queryset = Person.objects.filter(department__iexact="Human Resources")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # ---------------------------------------------------------------------
    # NEW: set portal account for a specific person
    # ---------------------------------------------------------------------
    @action(detail=True, methods=["patch"], url_path="set_portal_account")
    def set_portal_account(self, request, pk=None):
        person = self.get_object()

        portal_email = request.data.get("portal_email")
        portal_password = request.data.get("portal_password")
        portal_role = request.data.get("portal_role")

        if portal_email is not None:
            person.portal_email = portal_email
        if portal_password is not None:
            person.portal_password = portal_password
        if portal_role is not None:
            person.portal_role = portal_role

        person.save()
        serializer = self.get_serializer(person)
        return Response(serializer.data, status=status.HTTP_200_OK)
