# chatbot/web_urls.py

from django.urls import path
from .views.pages import ChatbotView

app_name = "chatbot"

urlpatterns = [

    path(
        "",
        ChatbotView.as_view(),
        name="index",
    ),

]