from django.urls import path
from django.views.generic import TemplateView

from .views.pages import LeaveManagementView

app_name = "leave"

urlpatterns = [

    path("management/",LeaveManagementView.as_view(), name="leave-management", ),

]