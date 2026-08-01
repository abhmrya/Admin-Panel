from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CurrentUserAPIView,
    LoginAPIView,
    LogoutAPIView,
    RegisterAPIView,
)

app_name = "api_accounts"

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("me/", CurrentUserAPIView.as_view(), name="current-user"),


    path("refresh/",TokenRefreshView.as_view(),name="refresh",)
]