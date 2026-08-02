from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class ManagerDashboardView(
    LoginRequiredMixin,
    TemplateView,
):

    template_name = "dashboard/manager/index.html"