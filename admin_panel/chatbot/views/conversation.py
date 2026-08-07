from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from chatbot.models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "title", "updated_at", "last_message"]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return last_msg.content if last_msg else ""


class MessageDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('chatbot.models', fromlist=['Message']).Message
        fields = ["id", "role", "content", "created_at"]


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at", "updated_at", "messages"]


class ConversationListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(user=self.request.user)
            .prefetch_related("messages")
            .order_by("-updated_at")
        )


class ConversationDetailAPIView(RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationDetailSerializer

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)