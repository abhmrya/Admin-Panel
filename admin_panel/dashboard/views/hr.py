from django.views.generic import TemplateView
from dashboard.mixins import RoleRequiredMixin


class HRDashboardView(TemplateView):

    allowed_roles = ["HR","ADMIN"]

    template_name = "dashboard/hr/index.html"