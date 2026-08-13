from django.views.generic import TemplateView

class LeaveManagementView(TemplateView):

    template_name = "admin_dashboard/leave_management.html"

class LeaveApplyView(TemplateView):
    template_name = "employee_dashboard/employee_leave.html"

class AdminLeaveApprovalPageView(TemplateView):
    template_name = "admin_dashboard/admin_leave_approval.html"