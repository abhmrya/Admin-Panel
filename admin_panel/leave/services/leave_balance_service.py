from django.db import transaction
from rest_framework.exceptions import ValidationError

from ..models import LeaveBalance


class LeaveBalanceService:

    @staticmethod
    @transaction.atomic
    def create_balance(
        *,
        user,
        leave_type,
        year,
        allocated_days,
    ):
        if not leave_type.is_active:
            raise ValidationError({
                "leave_type": (
                    "Cannot create balance for "
                    "an inactive leave type."
                )
            })

        if allocated_days < 0:
            raise ValidationError({
                "allocated_days": (
                    "Allocated days cannot be negative."
                )
            })

        existing_balance = LeaveBalance.objects.filter(
            user=user,
            leave_type=leave_type,
            year=year,
        ).exists()

        if existing_balance:
            raise ValidationError({
                "balance": (
                    "Leave balance already exists "
                    "for this employee and year."
                )
            })

        return LeaveBalance.objects.create(
            user=user,
            leave_type=leave_type,
            year=year,
            allocated_days=allocated_days,
            used_days=0,
            pending_days=0,
            remaining_days=allocated_days,
        )

    @staticmethod
    @transaction.atomic
    def update_allocation(
        *,
        balance,
        allocated_days,
    ):
        if allocated_days < 0:
            raise ValidationError({
                "allocated_days": (
                    "Allocated days cannot be negative."
                )
            })

        balance = (
            LeaveBalance.objects
            .select_for_update()
            .get(pk=balance.pk)
        )

        used_and_pending = (
            balance.used_days +
            balance.pending_days
        )

        if allocated_days < used_and_pending:
            raise ValidationError({
                "allocated_days": (
                    "Allocated days cannot be less than "
                    "used and pending days."
                )
            })

        balance.allocated_days = allocated_days
        balance.remaining_days = (
            allocated_days -
            balance.used_days
        )

        balance.save(
            update_fields=[
                "allocated_days",
                "remaining_days",
                "updated_at",
            ]
        )

        return balance