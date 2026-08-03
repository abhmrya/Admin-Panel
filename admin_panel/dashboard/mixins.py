from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden

class RoleRequiredMixin(LoginRequiredMixin):

    allowed_roles = []

    login_url = "/login/"

    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return self.handle_no_permission()

        if request.user.role not in self.allowed_roles:
            return HttpResponseForbidden("Permission denied.")

        return super().dispatch(request, *args, **kwargs)