from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet

def home_view(request):
    return HttpResponse("<h1>People App</h1><p><a href='/admin/'>Admin</a> | <a href='/api/employees/'>API</a></p>")

router = DefaultRouter()
router.register(r'employees', PersonViewSet)

urlpatterns = [
    path('', home_view, name='home'),  # This is the new line you're adding
    path('api/', include(router.urls)),
]