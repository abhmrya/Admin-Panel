from django.urls import path,include
from .views.pages import  AddDepartmetViewPage

app_name = "department"

urlpatterns = [

    path("add_department",AddDepartmetViewPage.as_view(),name='add_department'),

]