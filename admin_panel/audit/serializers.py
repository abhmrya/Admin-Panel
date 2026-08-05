from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):

    actor_email = serializers.CharField(
        source="actor.email",
        read_only=True
    )

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor_email",
            "action",
            "resource",
            "object_id",
            "old_values",
            "new_values",
            "ip_address",
            "request_method",
            "endpoint",
            "created_at",
        ]