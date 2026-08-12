from rest_framework import serializers

from ..models import LeavePolicy


class LeavePolicySerializer(serializers.ModelSerializer):

    leave_type_name = serializers.CharField(
        source="leave_type.name",
        read_only=True,
    )

    class Meta:
        model = LeavePolicy

        fields = [
            "id",
            "leave_type",
            "leave_type_name",
            "min_days_notice",
            "max_consecutive_days",
            "allow_half_day",
            "allow_backdated",
            "requires_reason",
            "requires_approval",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "leave_type_name",
            "created_at",
            "updated_at",
        ]