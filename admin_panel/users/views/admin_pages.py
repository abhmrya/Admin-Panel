from django.views.generic import TemplateView


class UsersPageView(TemplateView):

    template_name = "admin_dashboard/users.html"


class AddUsersAdminPageView(TemplateView):

    template_name = "admin_dashboard/admin_add_user.html"


class AddUsersHrPageView(TemplateView):

    template_name = "hr_dashboard/hr_add_user.html"
