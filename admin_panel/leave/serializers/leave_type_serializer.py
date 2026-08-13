from rest_framework import serializers

from ..models import LeaveType, LeavePolicy


class LeaveTypeSerializer(serializers.ModelSerializer):
    has_active_policy = serializers.SerializerMethodField()

    class Meta:
        model = LeaveType
        fields = [
            "id",
            "name",
            "code",
            "description",
            "days_per_year",
            "is_paid",
            "is_active",
            "has_active_policy",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "has_active_policy",
            "created_at",
            "updated_at",
        ]

    def get_has_active_policy(self, obj):
        return LeavePolicy.objects.filter(
            leave_type=obj,
            is_active=True,
        ).exists()

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Leave type name cannot be empty."
            )

        return value

    def validate_code(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Leave type code cannot be empty."
            )

        return value

    def validate_days_per_year(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Days per year cannot be negative."
            )

        return value