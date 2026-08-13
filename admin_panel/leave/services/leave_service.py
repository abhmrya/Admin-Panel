from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from ..models import (
    LeaveApproval,
    LeaveBalance,
    LeaveRequest,
)
from .leave_balance_service import LeaveBalanceService
from .leave_calculation_service import LeaveCalculationService
from .leave_policy_service import LeavePolicyService


class LeaveService:

    @staticmethod
    @transaction.atomic
    def create_leave_request(
        *,
        user,
        leave_type,
        start_date,
        end_date,
        day_type,
        reason,
    ):
        if start_date > end_date:
            raise ValidationError({
                "end_date": (
                    "End date must be greater than or equal "
                    "to start date."
                )
            })

        if not leave_type.is_active:
            raise ValidationError({
                "leave_type": (
                    "This leave type is inactive."
                )
            })

        LeavePolicyService.validate_request(
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            day_type=day_type,
            reason=reason,
        )

        try:
            total_days = (
                LeaveCalculationService.calculate_working_days(
                    start_date=start_date,
                    end_date=end_date,
                    day_type=day_type,
                )
            )
        except ValueError as exc:
            raise ValidationError({
                "date": str(exc)
            })

        if total_days <= 0:
            raise ValidationError({
                "date": (
                    "Selected date range contains "
                    "no working days."
                )
            })

        overlapping_request = LeaveRequest.objects.filter(
            user=user,
            status__in=[
                LeaveRequest.Status.PENDING,
                LeaveRequest.Status.APPROVED,
            ],
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).exists()

        if overlapping_request:
            raise ValidationError({
                "date": (
                    "You already have a leave request "
                    "for this date range."
                )
            })

        balance = LeaveBalanceService.get_or_create_balance(
            user=user,
            leave_type=leave_type,
            year=start_date.year,
        )

        available_days = (
            balance.remaining_days
            - balance.pending_days
        )

        if total_days > available_days:
            raise ValidationError({
                "total_days": (
                    "Insufficient leave balance."
                )
            })

        leave_request = LeaveRequest.objects.create(
            user=user,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            day_type=day_type,
            total_days=total_days,
            reason=reason.strip(),
            status=LeaveRequest.Status.PENDING,
        )

        balance.pending_days += total_days

        balance.save(
            update_fields=[
                "pending_days",
                "updated_at",
            ]
        )

        return leave_request

    @staticmethod
    @transaction.atomic
    def approve_leave_request(
        *,
        leave_request,
        reviewer,
        comment="",
    ):
        if leave_request.status != LeaveRequest.Status.PENDING:
            raise ValidationError({
                "status": (
                    "Only pending leave requests "
                    "can be approved."
                )
            })

        balance = (
            LeaveBalance.objects
            .select_for_update()
            .filter(
                user=leave_request.user,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year,
            )
            .first()
        )

        if not balance:
            raise ValidationError({
                "balance": (
                    "Leave balance is not configured."
                )
            })

        if leave_request.total_days > balance.pending_days:
            raise ValidationError({
                "balance": (
                    "Invalid pending leave balance."
                )
            })

        if leave_request.total_days > balance.remaining_days:
            raise ValidationError({
                "balance": (
                    "Insufficient remaining leave balance."
                )
            })

        balance.pending_days -= leave_request.total_days
        balance.used_days += leave_request.total_days
        balance.remaining_days -= leave_request.total_days

        balance.save(
            update_fields=[
                "pending_days",
                "used_days",
                "remaining_days",
                "updated_at",
            ]
        )

        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.reviewed_by = reviewer
        leave_request.reviewed_at = timezone.now()

        leave_request.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        LeaveApproval.objects.create(
            leave_request=leave_request,
            approver=reviewer,
            action=LeaveApproval.Action.APPROVED,
            comment=comment.strip(),
        )

        return leave_request

    @staticmethod
    @transaction.atomic
    def reject_leave_request(
        *,
        leave_request,
        reviewer,
        rejection_reason="",
    ):
        if leave_request.status != LeaveRequest.Status.PENDING:
            raise ValidationError({
                "status": (
                    "Only pending leave requests "
                    "can be rejected."
                )
            })

        balance = (
            LeaveBalance.objects
            .select_for_update()
            .filter(
                user=leave_request.user,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year,
            )
            .first()
        )

        if not balance:
            raise ValidationError({
                "balance": (
                    "Leave balance is not configured."
                )
            })

        if leave_request.total_days > balance.pending_days:
            raise ValidationError({
                "balance": (
                    "Invalid pending leave balance."
                )
            })

        balance.pending_days -= leave_request.total_days

        balance.save(
            update_fields=[
                "pending_days",
                "updated_at",
            ]
        )

        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.reviewed_by = reviewer
        leave_request.reviewed_at = timezone.now()
        leave_request.rejection_reason = (
            rejection_reason.strip()
        )

        leave_request.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "rejection_reason",
                "updated_at",
            ]
        )

        LeaveApproval.objects.create(
            leave_request=leave_request,
            approver=reviewer,
            action=LeaveApproval.Action.REJECTED,
            comment=rejection_reason.strip(),
        )

        return leave_request

    @staticmethod
    @transaction.atomic
    def cancel_leave_request(
        *,
        leave_request,
        user,
    ):
        if leave_request.user != user:
            raise ValidationError({
                "user": (
                    "You can only cancel "
                    "your own leave request."
                )
            })

        if leave_request.status not in [
            LeaveRequest.Status.PENDING,
            LeaveRequest.Status.APPROVED,
        ]:
            raise ValidationError({
                "status": (
                    "Only pending or approved leave "
                    "requests can be cancelled."
                )
            })

        today = timezone.localdate()

        if (
            leave_request.status
            == LeaveRequest.Status.APPROVED
            and leave_request.start_date <= today
        ):
            raise ValidationError({
                "start_date": (
                    "Approved leave cannot be cancelled "
                    "on or after its start date."
                )
            })

        balance = (
            LeaveBalance.objects
            .select_for_update()
            .filter(
                user=leave_request.user,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year,
            )
            .first()
        )

        if not balance:
            raise ValidationError({
                "balance": (
                    "Leave balance is not configured."
                )
            })

        if leave_request.status == LeaveRequest.Status.PENDING:

            if leave_request.total_days > balance.pending_days:
                raise ValidationError({
                    "balance": (
                        "Invalid pending leave balance."
                    )
                })

            balance.pending_days -= leave_request.total_days

            balance.save(
                update_fields=[
                    "pending_days",
                    "updated_at",
                ]
            )

        elif leave_request.status == LeaveRequest.Status.APPROVED:

            if leave_request.total_days > balance.used_days:
                raise ValidationError({
                    "balance": (
                        "Invalid used leave balance."
                    )
                })

            balance.used_days -= leave_request.total_days
            balance.remaining_days += leave_request.total_days

            balance.save(
                update_fields=[
                    "used_days",
                    "remaining_days",
                    "updated_at",
                ]
            )

        leave_request.status = LeaveRequest.Status.CANCELLED

        leave_request.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return leave_request