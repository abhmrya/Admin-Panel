from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CurrentUserAPIView,
    LoginAPIView,
    LogoutAPIView,
    RegisterAPIView,
    GoogleLoginAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
)


app_name = "api_accounts"


urlpatterns = [

    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutAPIView.as_view(),
        name="logout",
    ),

    path(
        "me/",
        CurrentUserAPIView.as_view(),
        name="current-user",
    ),

    path(
        "google/login/",
        GoogleLoginAPIView.as_view(),
        name="google_login",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="refresh",
    ),

    path(
        "password/forgot/",
        ForgotPasswordAPIView.as_view(),
        name="password-forgot",
    ),

    path(
        "password/reset/",
        ResetPasswordAPIView.as_view(),
        name="password-reset",
    ),
]