from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "status",
        "updated_at",
    )

    search_fields = (
        "title",
        "user__email",
        "user__username",
    )

    list_filter = (
        "status",
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "conversation",
        "role",
        "created_at",
    )

    search_fields = (
        "content",
    )

    list_filter = (
        "role",
    )