from django.urls import path
from .views.admin_pages import UsersPageView,AddUsersAdminPageView,AddUsersHrPageView


app_name="users"


urlpatterns=[

    path("",UsersPageView.as_view(),name="list"),
    path("add_users_admin",AddUsersAdminPageView.as_view(),name="AddUsersAdmin"),
    path("add_users_hr",AddUsersHrPageView.as_view(),name="AddUsersHr"),

]