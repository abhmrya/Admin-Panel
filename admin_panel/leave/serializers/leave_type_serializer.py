from rest_framework import serializers

from ..models import LeaveType


class LeaveTypeSerializer(serializers.ModelSerializer):
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
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

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