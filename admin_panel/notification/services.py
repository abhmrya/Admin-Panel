from django.utils import timezone

from .constants import NotificationType
from .models import Notification


class NotificationService:

    @staticmethod
    def create_notification(
        *,
        recipient,
        notification_type,
        title,
        message,
        metadata=None,
    ):
        return Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            metadata=metadata or {},
        )

    @staticmethod
    def mark_as_read(notification):
        if notification.is_read:
            return notification

        notification.is_read = True
        notification.read_at = timezone.now()

        notification.save(
            update_fields=[
                "is_read",
                "read_at",
                "updated_at",
            ]
        )

        return notification

    @staticmethod
    def mark_all_as_read(user):
        return Notification.objects.filter(
            recipient=user,
            is_read=False,
        ).update(
            is_read=True,
            read_at=timezone.now(),
        )

    @staticmethod
    def unread_count(user):
        return Notification.objects.filter(
            recipient=user,
            is_read=False,
        ).count()

    # =========================================================
    # LEAVE NOTIFICATIONS
    # =========================================================

    @staticmethod
    def notify_leave_submitted(
        *,
        leave_request,
    ):
        return NotificationService.create_notification(
            recipient=leave_request.user,
            notification_type=NotificationType.LEAVE_SUBMITTED,
            title="Leave Request Submitted",
            message=(
                f"Your {leave_request.leave_type.name} "
                "leave request has been submitted successfully."
            ),
            metadata={
                "leave_request_id": str(leave_request.id),
                "leave_type": leave_request.leave_type.name,
                "start_date": str(leave_request.start_date),
                "end_date": str(leave_request.end_date),
                "total_days": str(leave_request.total_days),
            },
        )

    @staticmethod
    def notify_leave_approved(
        *,
        leave_request,
        reviewer,
    ):
        return NotificationService.create_notification(
            recipient=leave_request.user,
            notification_type=NotificationType.LEAVE_APPROVED,
            title="Leave Request Approved",
            message=(
                f"Your {leave_request.leave_type.name} "
                "leave request has been approved."
            ),
            metadata={
                "leave_request_id": str(leave_request.id),
                "leave_type": leave_request.leave_type.name,
                "start_date": str(leave_request.start_date),
                "end_date": str(leave_request.end_date),
                "total_days": str(leave_request.total_days),
                "reviewer_id": str(reviewer.id),
            },
        )

    @staticmethod
    def notify_leave_rejected(
        *,
        leave_request,
        reviewer,
    ):
        return NotificationService.create_notification(
            recipient=leave_request.user,
            notification_type=NotificationType.LEAVE_REJECTED,
            title="Leave Request Rejected",
            message=(
                f"Your {leave_request.leave_type.name} "
                "leave request has been rejected."
            ),
            metadata={
                "leave_request_id": str(leave_request.id),
                "leave_type": leave_request.leave_type.name,
                "start_date": str(leave_request.start_date),
                "end_date": str(leave_request.end_date),
                "total_days": str(leave_request.total_days),
                "reviewer_id": str(reviewer.id),
                "rejection_reason": (
                    leave_request.rejection_reason or ""
                ),
            },
        )

    @staticmethod
    def notify_leave_cancelled(
        *,
        leave_request,
    ):
        return NotificationService.create_notification(
            recipient=leave_request.user,
            notification_type=NotificationType.LEAVE_CANCELLED,
            title="Leave Request Cancelled",
            message=(
                f"Your {leave_request.leave_type.name} "
                "leave request has been cancelled."
            ),
            metadata={
                "leave_request_id": str(leave_request.id),
                "leave_type": leave_request.leave_type.name,
                "start_date": str(leave_request.start_date),
                "end_date": str(leave_request.end_date),
                "total_days": str(leave_request.total_days),
            },
        )