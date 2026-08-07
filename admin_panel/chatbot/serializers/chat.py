from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    """
    Serializer for chatbot message request.
    """

    conversation_id = serializers.UUIDField(
        required=False,
        allow_null=True
    )

    message = serializers.CharField(
        max_length=5000
    )


    def validate_message(self, value):
        """
        Validate user message.
        """

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        return value



class ChatResponseSerializer(serializers.Serializer):
    """
    Serializer for chatbot response.
    """

    conversation_id = serializers.UUIDField()

    response = serializers.CharField()