from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.urls import reverse


class RoleRequiredMixin(LoginRequiredMixin):

    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):

        if request.user.role not in self.allowed_roles:
            return redirect("403")

        return super().dispatch(request, *args, **kwargs)