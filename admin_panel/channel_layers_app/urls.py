"""
URL configuration for dchannel_project project.

The `urlpatterns` list routes URLs to views.
"""

from django.urls import path

from . import views
from .views import RegisterView, LoginView, upload_audio


app_name = "channel"


urlpatterns = [

    # =========================================================
    # BASIC PAGES
    # =========================================================

    path(
        "base/",
        views.index,
        name="base",
    ),

    path(
        "index/",
        views.index,
        name="index",
    ),


    # =========================================================
    # AUTHENTICATION
    # =========================================================

    path(
        "login/",
        views.login_page,
        name="login",
    ),

    path(
        "accounts/login/",
        views.login_page,
        name="accounts_login",
    ),


    # =========================================================
    # AUTH APIs
    # =========================================================

    path(
        "api/register/",
        RegisterView.as_view(),
        name="api_register",
    ),

    path(
        "api/login/",
        LoginView.as_view(),
        name="api_login",
    ),

    path(
        "api/logout/",
        views.logout_view,
        name="api_logout",
    ),


    # =========================================================
    # CHAT HOME
    # =========================================================

    path(
        "one_home/",
        views.one_to_home,
        name="one_home",
    ),


    # =========================================================
    # GROUP CHAT
    # =========================================================

    # Group chat landing page
    path(
        "group/",
        views.group_chatt,
        name="group_home",
    ),

    # Specific group chat
    path(
        "group/<str:group_name>/",
        views.group_chat,
        name="group_chat",
    ),


    # =========================================================
    # ONE TO ONE CHAT
    # =========================================================

    path(
        "one/",
        views.oneto_one_chat,
        name="one_chat",
    ),


    # =========================================================
    # AUDIO
    # =========================================================

    path(
        "upload-audio/",
        upload_audio,
        name="upload_audio",
    ),
]