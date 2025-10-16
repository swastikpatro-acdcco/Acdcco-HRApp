from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet

# Simple home route for quick check
def home_view(request):
    return HttpResponse(
        "<h1>People App</h1><p><a href='/admin/'>Admin</a> | <a href='/api/people/'>API</a></p>"
    )

# Register REST endpoints
router = DefaultRouter()
router.register(r"people", PersonViewSet, basename="people")

urlpatterns = [
    path("", home_view, name="home"),
    path("", include(router.urls)),
]
