from django.urls import path
from .views.user_profile import ProfileView

urlpatterns = [
    path("me/",ProfileView.as_view(),name="profile-me",),
]