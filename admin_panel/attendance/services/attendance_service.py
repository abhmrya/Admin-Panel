from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Attendance, AttendanceStatus


class AttendanceService:

    @staticmethod
    @transaction.atomic
    def check_in(user):
        """
        Handles employee check-in logic.
        Enforces server timestamp and duplicate prevention.
        """
        today = timezone.localdate()
        now = timezone.now()

        existing_attendance = Attendance.objects.filter(employee=user, date=today).first()
        
        if existing_attendance:
            if existing_attendance.check_in:
                raise ValidationError("You have already checked in today.")
            existing_attendance.check_in = now
            existing_attendance.save(update_fields=["check_in", "updated_at"])
            return existing_attendance

        try:
            attendance = Attendance.objects.create(
                employee=user,
                date=today,
                check_in=now,
                status=AttendanceStatus.PRESENT,
            )
            return attendance
        except Exception:
            raise ValidationError("You have already checked in today.")

    @staticmethod
    @transaction.atomic
    def check_out(user):
        """
        Handles employee check-out logic.
        Requires active check-in and calculates working minutes server-side.
        """
        today = timezone.localdate()
        now = timezone.now()

        attendance = Attendance.objects.filter(employee=user, date=today).first()

        if not attendance or not attendance.check_in:
            raise ValidationError("You must check in before checking out.")

        if attendance.check_out:
            raise ValidationError("You have already checked out today.")

        delta = now - attendance.check_in
        working_minutes = int(delta.total_seconds() // 60)

        if working_minutes < 0:
            working_minutes = 0

        attendance.check_out = now
        attendance.working_minutes = working_minutes
        attendance.save(update_fields=["check_out", "working_minutes", "updated_at"])

        return attendance