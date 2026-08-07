from django.urls import path

from chatbot.views.chat import ChatAPIView
from chatbot.views.conversation import ConversationListAPIView

urlpatterns = [
    path("", ChatAPIView.as_view(), name="chat"),
    path(
        "conversations/",
        ConversationListAPIView.as_view(),
        name="conversation-list",
    ),
    path("chat/conversations/",ConversationListAPIView.as_view(),name="chat-conversations",),
]