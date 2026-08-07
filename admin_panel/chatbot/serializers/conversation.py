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