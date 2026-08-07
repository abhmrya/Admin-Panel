from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from chatbot.models import Conversation


class ConversationListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(user=self.request.user)
            .only("id", "title", "updated_at")
            .order_by("-updated_at")
        )