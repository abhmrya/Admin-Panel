import uuid
from django.conf import settings
from django.db import models


class AttendanceStatus(models.TextChoices):
    PRESENT = "PRESENT", "Present"
    ABSENT = "ABSENT", "Absent"
    HALF_DAY = "HALF_DAY", "Half Day"
    ON_LEAVE = "ON_LEAVE", "On Leave"


class Attendance(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendances",
    )

    date = models.DateField(
        help_text="Date of attendance",
    )

    check_in = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when employee checked in",
    )

    check_out = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when employee checked out",
    )

    status = models.CharField(
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.PRESENT,
    )

    working_minutes = models.PositiveIntegerField(
        default=0,
        help_text="Total working time calculated in minutes",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Attendance"
        verbose_name_plural = "Attendances"
        ordering = ["-date", "-created_at"]
        db_table = "attendances"

        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_employee_attendance_per_day",
            )
        ]

        indexes = [
            models.Index(fields=["employee", "date"]),
            models.Index(fields=["date"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.employee.email} - {self.date} ({self.status})"