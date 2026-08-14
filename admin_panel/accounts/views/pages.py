from django.views.generic import TemplateView

class LoginPageView(TemplateView):
    template_name="authentication/login.html"


class RegisterPageView(TemplateView):
    template_name="authentication/register.html"

class DashboardPageView(TemplateView):
    template_name = "dashboard/index.html"

from django.views.generic import TemplateView


class ResetPasswordPageView(TemplateView):

    template_name = "authentication/reset_password.html"

class ForgotPasswordPageView(TemplateView):

    template_name = "authentication/forgot_password.html"