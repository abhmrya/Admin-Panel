from django.urls import path

from .views import (
    AdminNotificationListView,
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    NotificationUnreadCountView,
)


app_name = "notification"


urlpatterns = [

    # User notifications
    path(
        "",
        NotificationListView.as_view(),
        name="list",
    ),

    # User unread count
    path(
        "unread-count/",
        NotificationUnreadCountView.as_view(),
        name="unread-count",
    ),

    # Mark single notification as read
    path(
        "<uuid:notification_id>/read/",
        NotificationMarkReadView.as_view(),
        name="mark-read",
    ),

    # Mark all user notifications as read
    path(
        "mark-all-read/",
        NotificationMarkAllReadView.as_view(),
        name="mark-all-read",
    ),

    # Admin - all notifications
    path(
        "admin/",
        AdminNotificationListView.as_view(),
        name="admin-list",
    ),
]