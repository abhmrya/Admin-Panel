from django.views.generic import TemplateView


class AttendanceWebView(TemplateView):
    template_name = "attendance/attendance.html"


class AdminAttendanceWebView(TemplateView):
    template_name = "attendance/admin_attendance.html"


class EmployeeMonthlyAttendanceView(TemplateView):
    template_name = "attendance/employee_monthly_attendance.html"

class AdminEmployeeMonthlyAttendanceView(TemplateView):
    template_name = "attendance/admin_employee_monthly.html"