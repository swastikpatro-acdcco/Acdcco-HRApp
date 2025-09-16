from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Person
from .serializers import PersonSerializer

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    
    @action(detail=False, methods=['get'])
    def by_department(self, request):
        department = request.query_params.get('department')
        if department:
            employees = Person.objects.filter(department=department)
            serializer = self.get_serializer(employees, many=True)
            return Response(serializer.data)
        return Response([])