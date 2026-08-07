from rest_framework import serializers

from chatbot.models import Conversation


class ConversationSerializer(serializers.ModelSerializer):

    last_message = serializers.SerializerMethodField()

    class Meta:

        model = Conversation

        fields = (

            "id",

            "title",

            "last_message",

            "updated_at",

            "created_at",

        )

    def get_last_message(self, obj):

        message = (

            obj.messages

            .order_by("-created_at")

            .first()

        )

        if not message:

            return ""

        return message.content[:80]