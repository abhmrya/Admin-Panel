from rest_framework import serializers

from ..models import LeaveRequest
from .leave_approval_serializer import LeaveApprovalSerializer


class LeaveHistorySerializer(serializers.ModelSerializer):
    employee_email = serializers.EmailField(source="user.email", read_only=True)
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    approvals = LeaveApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee_email",
            "leave_type_name",
            "start_date",
            "end_date",
            "day_type",
            "total_days",
            "reason",
            "status",
            "reviewed_at",
            "rejection_reason",
            "approvals",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields