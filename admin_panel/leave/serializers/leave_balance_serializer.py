from rest_framework import serializers

from ..models import LeaveBalance


class LeaveBalanceSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )
    leave_type_name = serializers.CharField(
        source="leave_type.name",
        read_only=True,
    )
    leave_type_code = serializers.CharField(
        source="leave_type.code",
        read_only=True,
    )

    class Meta:
        model = LeaveBalance
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "leave_type",
            "leave_type_name",
            "leave_type_code",
            "year",
            "allocated_days",
            "used_days",
            "pending_days",
            "remaining_days",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user_name",
            "user_email",
            "leave_type_name",
            "leave_type_code",
            "used_days",
            "pending_days",
            "remaining_days",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def validate_allocated_days(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Allocated days cannot be negative."
            )

        return value

    def validate_year(self, value):
        if value < 2000:
            raise serializers.ValidationError(
                "Invalid leave year."
            )

        return value