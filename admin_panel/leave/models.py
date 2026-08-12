from django.conf import settings
from django.db import models


class LeaveType(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.CharField(
        max_length=30,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    days_per_year = models.PositiveIntegerField(
        default=0,
    )

    is_paid = models.BooleanField(
        default=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "leave_types"
        ordering = ["name"]

    def __str__(self):
        return self.name


class LeaveBalance(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_balances",
    )

    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name="balances",
    )

    year = models.PositiveIntegerField()

    allocated_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    used_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    pending_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    remaining_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "leave_balances"
        ordering = ["-year"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "leave_type",
                    "year",
                ],
                name="unique_user_leave_type_year",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.leave_type.name} - "
            f"{self.year}"
        )


class LeaveRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    class DayType(models.TextChoices):
        FULL_DAY = "FULL_DAY", "Full Day"
        HALF_DAY = "HALF_DAY", "Half Day"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_requests",
    )

    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name="leave_requests",
    )

    start_date = models.DateField()
    end_date = models.DateField()

    day_type = models.CharField(
        max_length=20,
        choices=DayType.choices,
        default=DayType.FULL_DAY,
    )

    total_days = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_leave_requests",
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    rejection_reason = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "leave_requests"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "status"],
                name="leave_req_user_status_idx",
            ),
            models.Index(
                fields=["start_date", "end_date"],
                name="leave_req_date_range_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.leave_type.name} - "
            f"{self.start_date}"
        )

    
class Holiday(models.Model):
    name = models.CharField(
        max_length=150,
    )

    date = models.DateField(
        db_index=True,
    )

    description = models.TextField(
        blank=True,
    )

    is_optional = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "holidays"
        ordering = ["date"]
        constraints = [
            models.UniqueConstraint(
                fields=["date", "name"],
                name="unique_holiday_date_name",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.date}"


class LeavePolicy(models.Model):
    leave_type = models.OneToOneField(
        LeaveType,
        on_delete=models.CASCADE,
        related_name="policy",
    )

    min_days_notice = models.PositiveIntegerField(
        default=0,
    )

    max_consecutive_days = models.PositiveIntegerField(
        default=0,
    )

    allow_half_day = models.BooleanField(
        default=True,
    )

    allow_backdated = models.BooleanField(
        default=False,
    )

    requires_reason = models.BooleanField(
        default=True,
    )

    requires_approval = models.BooleanField(
        default=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "leave_policies"

    def __str__(self):
        return f"{self.leave_type.name} Policy"



class LeaveApproval(models.Model):

    class Action(models.TextChoices):
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    leave_request = models.ForeignKey(
        LeaveRequest,
        on_delete=models.CASCADE,
        related_name="approvals",
    )

    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="leave_approvals",
    )

    action = models.CharField(
        max_length=20,
        choices=Action.choices,
    )

    comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "leave_approvals"
        ordering = ["created_at"]

        indexes = [
            models.Index(
                fields=[
                    "leave_request",
                    "created_at",
                ],
                name="leave_approval_request_idx",
            ),
            models.Index(
                fields=[
                    "approver",
                    "created_at",
                ],
                name="leave_approval_approver_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.leave_request.id} - "
            f"{self.approver.email} - "
            f"{self.action}"
        )