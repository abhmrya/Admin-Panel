from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin
from accounts.choices import UserRole


class HRDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = [UserRole.HR]

    template_name = "dashboard/hr/index.html"