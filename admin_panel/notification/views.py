from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.choices import UserRole

from .models import Notification
from .serializers import NotificationSerializer
from .services import NotificationService


# =========================================================
# USER NOTIFICATIONS
# =========================================================

class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        )

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(
            {
                "count": notifications.count(),
                "unread_count": NotificationService.unread_count(
                    request.user
                ),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# USER UNREAD COUNT
# =========================================================

class NotificationUnreadCountView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            {
                "unread_count": NotificationService.unread_count(
                    request.user
                )
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# MARK SINGLE NOTIFICATION AS READ
# =========================================================

class NotificationMarkReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):

        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user,
        )

        NotificationService.mark_as_read(
            notification
        )

        return Response(
            NotificationSerializer(
                notification
            ).data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# MARK ALL USER NOTIFICATIONS AS READ
# =========================================================

class NotificationMarkAllReadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        updated_count = (
            NotificationService.mark_all_as_read(
                request.user
            )
        )

        return Response(
            {
                "message": (
                    "All notifications marked as read."
                ),
                "updated_count": updated_count,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ADMIN - ALL NOTIFICATIONS
# =========================================================

class AdminNotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # -------------------------------------------------
        # ADMIN ONLY
        # -------------------------------------------------

        if request.user.role != UserRole.ADMIN:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to view all notifications."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -------------------------------------------------
        # ALL NOTIFICATIONS
        # -------------------------------------------------

        notifications = (
            Notification.objects
            .select_related("recipient")
            .all()
        )

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(
            {
                "count": notifications.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )