from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin
from accounts.choices import UserRole


class ManagerDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = [UserRole.MANAGER]

    template_name = "dashboard/manager/index.html"