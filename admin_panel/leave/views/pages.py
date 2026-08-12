from django.views.generic import TemplateView

class LeaveManagementView(TemplateView):

    template_name = "admin_dashboard/leave_management.html"
    