from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect


class RoleRequiredMixin(LoginRequiredMixin):

    allowed_roles = []

    login_url = "accounts:login"


    def dispatch(self, request, *args, **kwargs):

        if request.user.role not in self.allowed_roles:

            return redirect(
                "dashboard:index"
            )


        return super().dispatch(
            request,
            *args,
            **kwargs
        )