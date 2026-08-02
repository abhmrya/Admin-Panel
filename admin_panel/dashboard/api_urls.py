from django.urls import path

from .views.api import DashboardStatsAPIView


app_name = "dashboard_api"


urlpatterns = [

    path("stats/",DashboardStatsAPIView.as_view(),name="dashboard_stats"),

]