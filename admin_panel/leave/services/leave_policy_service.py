from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from ..models import LeavePolicy, LeaveRequest


class LeavePolicyService:

    @staticmethod
    def get_policy(leave_type):
        policy = LeavePolicy.objects.filter(
            leave_type=leave_type,
            is_active=True,
        ).first()

        if not policy:
            raise ValidationError({
                "leave_type": (
                    "Leave policy is not configured "
                    "for this leave type."
                )
            })

        return policy

    @staticmethod
    def validate_request(
        *,
        leave_type,
        start_date,
        end_date,
        day_type,
        reason,
    ):
        policy = LeavePolicyService.get_policy(
            leave_type
        )

        today = timezone.localdate()

        if (
            start_date < today
            and not policy.allow_backdated
        ):
            raise ValidationError({
                "start_date": (
                    "Backdated leave is not allowed "
                    "for this leave type."
                )
            })

        if (
            policy.min_days_notice > 0
            and start_date >= today
        ):
            minimum_date = (
                today
                + timedelta(
                    days=policy.min_days_notice
                )
            )

            if start_date < minimum_date:
                raise ValidationError({
                    "start_date": (
                        f"Leave must be applied at least "
                        f"{policy.min_days_notice} days "
                        "in advance."
                    )
                })

        requested_days = (
            end_date - start_date
        ).days + 1

        if (
            policy.max_consecutive_days > 0
            and requested_days > policy.max_consecutive_days
        ):
            raise ValidationError({
                "end_date": (
                    f"Maximum {policy.max_consecutive_days} "
                    "consecutive leave days are allowed."
                )
            })

        if (
            day_type == LeaveRequest.DayType.HALF_DAY
            and not policy.allow_half_day
        ):
            raise ValidationError({
                "day_type": (
                    "Half day leave is not allowed "
                    "for this leave type."
                )
            })

        if (
            policy.requires_reason
            and not reason.strip()
        ):
            raise ValidationError({
                "reason": "Reason is required."
            })

        return policy