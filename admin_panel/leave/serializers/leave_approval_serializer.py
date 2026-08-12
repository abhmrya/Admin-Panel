from rest_framework import serializers

from ..models import LeaveApproval


class LeaveApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.SerializerMethodField()
    approver_email = serializers.EmailField(
        source="approver.email",
        read_only=True,
    )

    class Meta:
        model = LeaveApproval
        fields = [
            "id",
            "leave_request",
            "approver",
            "approver_name",
            "approver_email",
            "action",
            "comment",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "approver",
            "approver_name",
            "approver_email",
            "created_at",
        ]

    def get_approver_name(self, obj):
        return (
            f"{obj.approver.first_name} "
            f"{obj.approver.last_name}"
        ).strip()