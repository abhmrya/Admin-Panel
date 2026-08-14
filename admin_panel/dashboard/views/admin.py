from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin
from accounts.choices import UserRole


class AdminDashboardView(RoleRequiredMixin,TemplateView):

    allowed_roles = [UserRole.ADMIN]

    template_name = "dashboard/admin/index.html"