from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from common.permission import IsAdminOrManagerOrEmployee 

class AttendanceWebView(TemplateView):
    """
    Renders the attendance management web dashboard page.
    """
    template_name = "attendance/attendance.html"

class AdminAttendanceWebView(TemplateView):

    template_name = "attendance/admin_attendance.html"