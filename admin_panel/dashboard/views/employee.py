from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class EmployeeDashboardView(LoginRequiredMixin, TemplateView):

    template_name = "dashboard/employee/index.html"

    def dispatch(self, request, *args, **kwargs):
        print("USER:", request.user)
        print("AUTH:", request.user.is_authenticated)

        return super().dispatch(request, *args, **kwargs)