from rest_framework import serializers

from ..models import LeaveRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )
    leave_type_name = serializers.CharField(
        source="leave_type.name",
        read_only=True,
    )
    approval_history = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest

        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "leave_type",
            "leave_type_name",
            "start_date",
            "end_date",
            "day_type",
            "total_days",
            "reason",
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "approval_history",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "leave_type_name",
            "total_days",
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "approval_history",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        return (
            f"{obj.user.first_name} "
            f"{obj.user.last_name}"
        ).strip()

    def get_approval_history(self, obj):
        return [
            {
                "id": approval.id,
                "approver": approval.approver_id,
                "approver_name": (
                    f"{approval.approver.first_name} "
                    f"{approval.approver.last_name}"
                ).strip(),
                "approver_email": approval.approver.email,
                "action": approval.action,
                "comment": approval.comment,
                "created_at": approval.created_at,
            }
            for approval in obj.approvals.all()
        ]