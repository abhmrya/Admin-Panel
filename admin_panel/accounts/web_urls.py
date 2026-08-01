from django.urls import path
from .views.pages import (
    LoginPageView,
    RegisterPageView,
    DashboardPageView,
)

app_name = "accounts"

urlpatterns = [
    path("login/", LoginPageView.as_view(), name="login"),
    path("register/", RegisterPageView.as_view(), name="register"),
    # path("dashboard/", DashboardPageView.as_view(), name="dashboard"),
]