from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin


class ManagerDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = ["MANAGER","ADMIN"]

    template_name = "dashboard/manager/index.html"