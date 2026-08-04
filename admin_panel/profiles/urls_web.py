from django.urls import path
from .views.pages import ProfilePageView

app_name = "profile"

urlpatterns = [
    path("",ProfilePageView.as_view(),name="index",),
]