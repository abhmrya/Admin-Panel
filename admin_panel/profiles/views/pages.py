from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin


class ProfilePageView(LoginRequiredMixin, TemplateView):
    template_name = "profile/profile.html"