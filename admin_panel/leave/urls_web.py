from django.urls import path
from django.views.generic import TemplateView

from .views.pages import (LeaveManagementView,LeaveApplyView,
                          AdminLeaveApprovalPageView,LeaveDashboardView,EmployeeHistoryView,
                          AdminLeaveRequestsView)

app_name = "leave"

urlpatterns = [

    path("management/",LeaveManagementView.as_view(), name="leave-management", ),
    path("apply/", LeaveApplyView.as_view(), name="apply"),
    path("approval/",AdminLeaveApprovalPageView.as_view(),name="admin-leave-approval",),
    path("dashboard/",LeaveDashboardView.as_view(),name="admin-leave-dashboard",),
    path("employee_history/",EmployeeHistoryView.as_view(),name="employee-history"),
    path("admin/leave-requests/",AdminLeaveRequestsView.as_view(),name="admin-leave-requests",)

]