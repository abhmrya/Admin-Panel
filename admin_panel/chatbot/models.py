from django.conf import settings
from django.db import models
from uuid import uuid4


class Conversation(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    title = models.CharField(max_length=255, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chat_conversations"
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["status"]),
            models.Index(fields=["updated_at"]),
        ]

    def __str__(self):
        return self.title or f"Conversation {self.pk}"


class Message(models.Model):
    
    class Role(models.TextChoices):
        SYSTEM = "SYSTEM", "System"
        USER = "USER", "User"
        ASSISTANT = "ASSISTANT", "Assistant"

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )

    content = models.TextField()

    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)

    response_time = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation"]),
            models.Index(fields=["role"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.role} - {self.conversation_id}"

