from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from ..models import Attendance

from django.db.models import Sum, Count, Q

class AttendanceService:

    @staticmethod
    @transaction.atomic
    def check_in(user):
        today = timezone.localdate()

        attendance = Attendance.objects.filter(employee=user, date=today).first()

        if attendance:
            raise ValidationError("You have already checked in today.")

        return Attendance.objects.create(
            employee=user,
            date=today,
            check_in=timezone.now(),
            status="PRESENT",
        )

    @staticmethod
    @transaction.atomic
    def check_out(user):
        today = timezone.localdate()

        attendance = Attendance.objects.filter(employee=user, date=today).first()

        if not attendance:
            raise ValidationError("You have not checked in today.")

        if attendance.check_out:
            raise ValidationError("You have already checked out today.")

        attendance.check_out = timezone.now()
        attendance.working_minutes = AttendanceService.calculate_working_minutes(attendance.check_in, attendance.check_out)

        attendance.save(update_fields=["check_out", "working_minutes", "updated_at"])

        return attendance

    @staticmethod
    def calculate_working_minutes(check_in, check_out):
        if not check_in or not check_out:
            return 0

        delta = check_out - check_in

        return max(int(delta.total_seconds() // 60), 0)

    @staticmethod
    @transaction.atomic
    def update_attendance(attendance, validated_data):
        check_in = validated_data.get("check_in", attendance.check_in)
        check_out = validated_data.get("check_out", attendance.check_out)

        if check_in and check_out and check_out < check_in:
            raise ValidationError("Check-out time cannot be earlier than check-in time.")

        for attr, value in validated_data.items():
            setattr(attendance, attr, value)

        attendance.working_minutes = AttendanceService.calculate_working_minutes(check_in, check_out)

        attendance.save()

        return attendance


    @staticmethod
    def get_monthly_summary(user, year, month):
        queryset = Attendance.objects.filter(employee=user, date__year=year, date__month=month)

        summary = queryset.aggregate(
            total_days=Count("id"),
            present_days=Count("id", filter=Q(status="PRESENT")),
            absent_days=Count("id", filter=Q(status="ABSENT")),
            half_days=Count("id", filter=Q(status="HALF_DAY")),
            leave_days=Count("id", filter=Q(status="ON_LEAVE")),
            total_working_minutes=Sum("working_minutes"),
        )

        total_minutes = summary["total_working_minutes"] or 0

        summary["total_working_hours"] = f"{total_minutes // 60}h {total_minutes % 60}m"

        return summary