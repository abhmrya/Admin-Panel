from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin


class AdminDashboardView(TemplateView):

    allowed_roles = ["ADMIN"]

    template_name = "dashboard/admin/index.html"