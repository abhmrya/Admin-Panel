# chatbot/services/conversation_service.py

from chatbot.models import Conversation, Message


class ConversationService:

    @staticmethod
    def create_conversation(user):
        return Conversation.objects.create(
            user=user,
            title="New Chat",
        )

    @staticmethod
    def save_user_message(conversation, content):
        return Message.objects.create(
            conversation=conversation,
            role=Message.Role.USER,
            content=content,
        )

    @staticmethod
    def save_ai_message(
        conversation,
        content,
    ):
        return Message.objects.create(
            conversation=conversation,
            role=Message.Role.ASSISTANT,
            content=content,
        )

    @staticmethod
    def get_messages(conversation):
        return conversation.messages.all()