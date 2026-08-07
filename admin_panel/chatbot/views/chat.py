from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from chatbot.models import Conversation
from chatbot.serializers import ChatRequestSerializer
from chatbot.services import AIService, ConversationService


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation_id = serializer.validated_data.get("conversation_id")
        message = serializer.validated_data["message"]

        if conversation_id:
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                user=request.user,
            )
        else:
            conversation = ConversationService.create_conversation(request.user)

        ConversationService.save_user_message(
            conversation=conversation,
            content=message,
        )

        history = ConversationService.get_messages(conversation)

        ai = AIService.generate_response(history)

        ConversationService.save_ai_message(
            conversation=conversation,
            content=ai["content"],
        )

        return Response(
            {
                "conversation_id": conversation.id,
                "response": ai["content"],
            }
        )