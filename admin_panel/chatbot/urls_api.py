from django.urls import path
from chatbot.views.chat import ChatAPIView
from chatbot.views.conversation import ConversationListAPIView, ConversationDetailAPIView

urlpatterns = [
    path("", ChatAPIView.as_view(), name="chat"),
    path("conversations/", ConversationListAPIView.as_view(), name="conversation-list"),
    path("conversations/<uuid:pk>/", ConversationDetailAPIView.as_view(), name="conversation-detail"),
]