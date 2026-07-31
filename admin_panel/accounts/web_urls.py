from django.urls import path

from .views.pages import (
    LoginPageView,
    RegisterPageView,
)


app_name="accounts"


urlpatterns=[
    path("login/",LoginPageView.as_view(),name="login"),
    path("register/",RegisterPageView.as_view(),name="register"),
]