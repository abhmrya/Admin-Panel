from rest_framework.routers import DefaultRouter
from .views.attendance_view import AttendanceViewSet

router = DefaultRouter()
router.register(r"", AttendanceViewSet, basename="attendance")

urlpatterns = router.urls