from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin


class EmployeeDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = ["EMPLOYEE","MANAGER","HR","ADMIN"]

    template_name = "dashboard/employee/index.html"