from rest_framework.routers import DefaultRouter
from .views.department import DepartmentViewSet

router = DefaultRouter()

router.register(r"", DepartmentViewSet, basename="departments")

urlpatterns = router.urls