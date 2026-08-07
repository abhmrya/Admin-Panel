from django.views.generic import TemplateView


class ChatbotView(TemplateView):

    template_name = "chatbot/chatbot.html"