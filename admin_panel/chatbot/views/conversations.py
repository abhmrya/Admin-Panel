from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chatbot.models import Conversation
from chatbot.serializers.conversation import (
    ConversationSerializer,
)


class ConversationListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        conversations = (

            Conversation.objects

            .filter(user=request.user)

            .order_by("-updated_at")

        )

        serializer = ConversationSerializer(

            conversations,

            many=True,

        )

        return Response(serializer.data)