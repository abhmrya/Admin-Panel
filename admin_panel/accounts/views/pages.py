from django.views.generic import TemplateView
from django.views.generic import TemplateView

class LoginPageView(TemplateView):
    template_name="authentication/login.html"


class RegisterPageView(TemplateView):
    template_name="authentication/register.html"

class DashboardPageView(TemplateView):
    template_name = "dashboard/index.html"