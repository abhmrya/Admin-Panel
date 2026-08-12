from rest_framework import serializers

from ..models import Attendance
from ..services.attendance_service import AttendanceService


class AttendanceSerializer(serializers.ModelSerializer):

    employee_name = serializers.CharField(
        source="employee.first_name",
        read_only=True,
    )

    employee_email = serializers.EmailField(
        source="employee.email",
        read_only=True,
    )

    working_hours = serializers.SerializerMethodField()

    class Meta:
        model = Attendance

        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_email",
            "date",
            "check_in",
            "check_out",
            "status",
            "working_minutes",
            "working_hours",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "employee",
            "employee_name",
            "employee_email",
            "working_minutes",
            "working_hours",
            "created_at",
            "updated_at",
        ]

    def get_working_hours(self, obj):
        minutes = obj.working_minutes or 0
        hours = minutes // 60
        remaining_minutes = minutes % 60

        return f"{hours}h {remaining_minutes}m"

    def validate(self, attrs):
        check_in = attrs.get("check_in", self.instance.check_in if self.instance else None)
        check_out = attrs.get("check_out", self.instance.check_out if self.instance else None)

        if check_in and check_out and check_out < check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out time cannot be earlier than check-in time."
            })

        return attrs

    def update(self, instance, validated_data):
        return AttendanceService.update_attendance(instance, validated_data)