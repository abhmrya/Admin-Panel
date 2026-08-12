from django.db.models import Count, Sum
from django.utils import timezone

from ..models import LeaveBalance, LeaveRequest


class LeaveDashboardService:

    @staticmethod
    def get_employee_summary(user, year=None):
        year = year or timezone.localdate().year

        balances = (
            LeaveBalance.objects
            .filter(
                user=user,
                year=year,
                leave_type__is_active=True,
            )
            .select_related("leave_type")
            .order_by("leave_type__name")
        )

        leave_balances = []

        total_allocated = 0
        total_used = 0
        total_pending = 0
        total_remaining = 0

        for balance in balances:
            total_allocated += balance.allocated_days
            total_used += balance.used_days
            total_pending += balance.pending_days
            total_remaining += balance.remaining_days

            leave_balances.append({
                "leave_type": balance.leave_type.id,
                "leave_type_name": balance.leave_type.name,
                "leave_type_code": balance.leave_type.code,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "pending_days": balance.pending_days,
                "remaining_days": balance.remaining_days,
            })

        request_counts = LeaveRequest.objects.filter(
            user=user,
        ).values(
            "status",
        ).annotate(
            count=Count("id"),
        )

        counts = {
            "pending": 0,
            "approved": 0,
            "rejected": 0,
            "cancelled": 0,
        }

        for item in request_counts:
            status = item["status"].lower()
            if status in counts:
                counts[status] = item["count"]

        return {
            "year": year,
            "summary": {
                "allocated_days": total_allocated,
                "used_days": total_used,
                "pending_days": total_pending,
                "remaining_days": total_remaining,
            },
            "leave_balances": leave_balances,
            "request_counts": counts,
        }

    @staticmethod
    def get_manager_summary(user):
        team_users = user.team_members.all()

        team_requests = LeaveRequest.objects.filter(
            user__in=team_users,
        )

        return {
            "team_size": team_users.count(),
            "pending_requests": team_requests.filter(
                status=LeaveRequest.Status.PENDING,
            ).count(),
            "approved_requests": team_requests.filter(
                status=LeaveRequest.Status.APPROVED,
            ).count(),
            "rejected_requests": team_requests.filter(
                status=LeaveRequest.Status.REJECTED,
            ).count(),
        }

    @staticmethod
    def get_admin_summary(year=None):
        year = year or timezone.localdate().year

        requests = LeaveRequest.objects.all()

        status_counts = requests.values(
            "status",
        ).annotate(
            count=Count("id"),
        )

        request_counts = {
            "pending": 0,
            "approved": 0,
            "rejected": 0,
            "cancelled": 0,
        }

        for item in status_counts:
            status = item["status"].lower()

            if status in request_counts:
                request_counts[status] = item["count"]

        balance_summary = LeaveBalance.objects.filter(
            year=year,
        ).aggregate(
            total_allocated=Sum("allocated_days"),
            total_used=Sum("used_days"),
            total_pending=Sum("pending_days"),
            total_remaining=Sum("remaining_days"),
        )

        leave_type_statistics = (
            LeaveRequest.objects
            .filter(
                start_date__year=year,
            )
            .values(
                "leave_type",
                "leave_type__name",
                "leave_type__code",
            )
            .annotate(
                total_requests=Count("id"),
                total_days=Sum("total_days"),
            )
            .order_by(
                "-total_requests",
            )
        )

        leave_types = [
            {
                "leave_type": item["leave_type"],
                "leave_type_name": item[
                    "leave_type__name"
                ],
                "leave_type_code": item[
                    "leave_type__code"
                ],
                "total_requests": item[
                    "total_requests"
                ],
                "total_days": item[
                    "total_days"
                ],
            }
            for item in leave_type_statistics
        ]

        return {
            "year": year,
            "request_counts": request_counts,
            "balance_summary": {
                "total_allocated": (
                    balance_summary["total_allocated"]
                    or 0
                ),
                "total_used": (
                    balance_summary["total_used"]
                    or 0
                ),
                "total_pending": (
                    balance_summary["total_pending"]
                    or 0
                ),
                "total_remaining": (
                    balance_summary["total_remaining"]
                    or 0
                ),
            },
            "leave_type_statistics": leave_types,
        }