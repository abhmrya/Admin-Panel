from django.views.generic import TemplateView


class UsersPageView(TemplateView):

    template_name = "admin_dashboard/users.html"