from django.urls import path
from .views.pages import (
    LoginPageView,
    RegisterPageView,
    DashboardPageView,
    ResetPasswordPageView,
    ForgotPasswordPageView
)

app_name = "accounts"

urlpatterns = [
    path("login/", LoginPageView.as_view(), name="login"),
    path("register/", RegisterPageView.as_view(), name="register"),
    # path("dashboard/", DashboardPageView.as_view(), name="dashboard"),
    path("reset-password/<uid>/<token>/",ResetPasswordPageView.as_view(),name="reset-password",),
    path("forgot-password/",ForgotPasswordPageView.as_view(),name="forgot-password",),
]