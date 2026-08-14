from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin
from accounts.choices import UserRole


class EmployeeDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = [UserRole.EMPLOYEE]

    template_name = "dashboard/employee/index.html"