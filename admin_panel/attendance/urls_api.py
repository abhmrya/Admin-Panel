from django.urls import path
from rest_framework.routers import DefaultRouter

from .views.attendance_view import AttendanceViewSet
from .views.attendance_report import MonthlyAttendanceReportAPIView


router = DefaultRouter()

router.register(
    r"",
    AttendanceViewSet,
    basename="attendance",
)


urlpatterns = [
    path(
        "reports/monthly/",
        MonthlyAttendanceReportAPIView.as_view(),
        name="monthly-attendance-report",
    ),
]

urlpatterns += router.urls