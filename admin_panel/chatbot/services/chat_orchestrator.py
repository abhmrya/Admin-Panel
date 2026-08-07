"""
Chat Orchestrator

Responsible for coordinating:

User Message
      |
      ↓
Conversation History
      |
      ↓
AI Service
      |
      ↓
Final Response
"""


from chatbot.services.ai_service import AIService
from chatbot.services.conversation_service import ConversationService



class ChatOrchestrator:
    """
    Main coordinator of chatbot.
    """


    @staticmethod
    def process(
        conversation,
        message,
    ):
        """
        Process user message.

        Flow:

        Save user message
              ↓
        Get history
              ↓
        AIService.chat()
              ↓
        Return AI response
        """


        # Save user message

        ConversationService.save_user_message(
            conversation=conversation,
            content=message,
        )


        # Get conversation history

        history = ConversationService.get_messages(
            conversation
        )


        # Generate AI response

        ai_response = AIService.chat(
            messages=history
        )


        # Save AI response

        ConversationService.save_ai_message(
            conversation=conversation,
            content=ai_response["content"],
        )


        return ai_response