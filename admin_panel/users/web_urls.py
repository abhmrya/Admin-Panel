from django.urls import path
from .views.admin_pages import UsersPageView


app_name="users"


urlpatterns=[

    path("",UsersPageView.as_view(),name="list"),

]