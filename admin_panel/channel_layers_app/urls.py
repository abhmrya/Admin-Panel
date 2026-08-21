"""
URL configuration for dchannel_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views
from .views import RegisterView,LoginView
from .views import upload_audio

urlpatterns = [
    path('base/', views.index, name="index"),
    path('index/', views.index, name="index"),
    # path('', views.register_page, name='register'),
    path('login/', views.login_page, name='login'),
     path("accounts/login/", views.login_page),
    path('api/register/', RegisterView.as_view(), name='apiregister'),
    path('api/login/', LoginView.as_view(), name='apilogin'),
    # path('api/logout/', LogoutView.as_view(), name='apilogout'),
    path("api/logout/", views.logout_view, name="apilogout"),

    path('one_home/', views.one_to_home, name='one_home'),

    path('group/', views.group_chatt, name="group_chat"),
    path('group/<str:group_name>/', views.group_chat, name="group_chat"),
    path('one/', views.oneto_one_chat, name="one_chat"),


    #   path("index/<str:group_name>/", views.group_chat, name="group_chat"),
    path("upload-audio/", views.upload_audio, name="upload_audio"),




]
