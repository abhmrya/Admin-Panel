from rest_framework import serializers

from attendance.models import Attendance


class MonthlyAttendanceRecordSerializer(
    serializers.ModelSerializer
):
    employee_name = serializers.SerializerMethodField()
    employee_email = serializers.EmailField(
        source="employee.email",
        read_only=True,
    )
    working_hours = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee_name",
            "employee_email",
            "date",
            "check_in",
            "check_out",
            "working_minutes",
            "working_hours",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_employee_name(self, obj):
        employee = obj.employee

        full_name = " ".join(
            filter(
                None,
                [
                    employee.first_name,
                    employee.last_name,
                ],
            )
        )

        return (
            full_name
            or getattr(employee, "username", None)
            or employee.email
        )

    def get_working_hours(self, obj):
        minutes = obj.working_minutes or 0

        hours = minutes // 60
        remaining_minutes = minutes % 60

        return f"{hours}h {remaining_minutes}m"


class MonthlyAttendanceSummarySerializer(
    serializers.Serializer
):
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    half_day = serializers.IntegerField()
    on_leave = serializers.IntegerField()
    total_working_minutes = serializers.IntegerField()
    total_working_hours = serializers.CharField()


class MonthlyAttendanceEmployeeSerializer(
    serializers.Serializer
):
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()


class MonthlyAttendanceReportSerializer(
    serializers.Serializer
):
    employee = MonthlyAttendanceEmployeeSerializer()

    period = serializers.DictField()

    summary = MonthlyAttendanceSummarySerializer()

    records = MonthlyAttendanceRecordSerializer(
        many=True
    )