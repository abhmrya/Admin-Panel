from django.urls import path

from .views.pages import DashboardPageView


app_name = "dashboard"


urlpatterns = [

    path("",DashboardPageView.as_view(),name="index"),

]