from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class HRDashboardView(
    LoginRequiredMixin,
    TemplateView,
):

    template_name = "dashboard/hr/index.html"