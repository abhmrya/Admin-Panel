from django.urls import path
from .views.pages import AttendanceWebView,AdminAttendanceWebView

app_name = "attendance"

urlpatterns = [
    path("", AttendanceWebView.as_view(), name="index"),
    path("admin-view/", AdminAttendanceWebView.as_view(), name="admin-attendance-page"),


]