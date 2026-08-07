from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


from chatbot.models import Conversation
from chatbot.serializers import ChatRequestSerializer

from chatbot.services.conversation_service import ConversationService
from chatbot.services.chat_orchestrator import ChatOrchestrator



class ChatAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def post(self, request):

        serializer = ChatRequestSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )


        conversation_id = serializer.validated_data.get(
            "conversation_id"
        )


        message = serializer.validated_data[
            "message"
        ]


        # ---------------------------------
        # Existing Conversation
        # ---------------------------------

        if conversation_id:

            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                user=request.user,
            )


        # ---------------------------------
        # New Conversation
        # ---------------------------------

        else:

            conversation = ConversationService.create_conversation(
                user=request.user
            )


        # ---------------------------------
        # Process Chat
        # ---------------------------------

        response = ChatOrchestrator.process(
            conversation=conversation,
            message=message,
        )


        return Response(
            {
                "conversation_id": str(
                    conversation.id
                ),

                "response": response["content"],

                "tool_used": response.get(
                    "tool_used"
                ),

                "response_time": response.get(
                    "response_time"
                ),

            },

            status=status.HTTP_200_OK
        )