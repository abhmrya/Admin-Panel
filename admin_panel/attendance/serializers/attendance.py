from rest_framework import serializers

from ..models import Attendance


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

            # Employee information
            "employee",
            "employee_name",
            "employee_email",

            # Attendance information
            "date",
            "check_in",
            "check_out",
            "status",
            "working_minutes",
            "working_hours",

            # Audit timestamps
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
        check_in = attrs.get("check_in")
        check_out = attrs.get("check_out")

        # During PATCH, existing values may not be present
        if self.instance:
            check_in = (
                check_in
                if "check_in" in attrs
                else self.instance.check_in
            )

            check_out = (
                check_out
                if "check_out" in attrs
                else self.instance.check_out
            )

        if check_in and check_out and check_out < check_in:
            raise serializers.ValidationError(
                {
                    "check_out": "Check-out time cannot be earlier than check-in time."
                }
            )

        return attrs

    def update(self, instance, validated_data):
        check_in = validated_data.get(
            "check_in",
            instance.check_in,
        )

        check_out = validated_data.get(
            "check_out",
            instance.check_out,
        )

        # Update normal editable fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate working minutes server-side
        if check_in and check_out:
            delta = check_out - check_in

            working_minutes = int(
                delta.total_seconds() // 60
            )

            instance.working_minutes = max(
                working_minutes,
                0,
            )

        else:
            instance.working_minutes = 0

        instance.save()

        return instance