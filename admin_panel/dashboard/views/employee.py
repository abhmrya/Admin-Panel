from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin


class EmployeeDashboardView(TemplateView):

    template_name = "dashboard/employee/index.html"