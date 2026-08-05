import uuid

from django.db import models

from accounts.models import User



class AuditLog(models.Model):


    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )


    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )


    action = models.CharField(
        max_length=100
    )


    resource = models.CharField(
        max_length=100
    )


    object_id = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )


    old_values = models.JSONField(
        null=True,
        blank=True
    )


    new_values = models.JSONField(
        null=True,
        blank=True
    )


    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )


    user_agent = models.TextField(
        null=True,
        blank=True
    )


    request_method = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )


    endpoint = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )



    class Meta:

        ordering = [
            "-created_at"
        ]


        indexes = [

            models.Index(
                fields=[
                    "action"
                ]
            ),

            models.Index(
                fields=[
                    "created_at"
                ]
            ),

        ]



    def __str__(self):

        return f"{self.action} - {self.actor}"