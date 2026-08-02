from django.urls import path

from .views.index import index
from .views.admin import AdminDashboardView
from .views.hr import HRDashboardView
from .views.manager import ManagerDashboardView
from .views.employee import EmployeeDashboardView

app_name = "dashboard"

urlpatterns = [

    path(
        "",
        index,
        name="index",
    ),

    path(
        "admin/",
        AdminDashboardView.as_view(),
        name="admin_dashboard",
    ),

    path(
        "hr/",
        HRDashboardView.as_view(),
        name="hr_dashboard",
    ),

    path(
        "manager/",
        ManagerDashboardView.as_view(),
        name="manager_dashboard",
    ),

    path(
        "employee/",
        EmployeeDashboardView.as_view(),
        name="employee_dashboard",
    ),

]