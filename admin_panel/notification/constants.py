from django.db import models


class NotificationType(models.TextChoices):
    LEAVE_SUBMITTED = "LEAVE_SUBMITTED", "Leave Submitted"
    LEAVE_APPROVED = "LEAVE_APPROVED", "Leave Approved"
    LEAVE_REJECTED = "LEAVE_REJECTED", "Leave Rejected"
    LEAVE_CANCELLED = "LEAVE_CANCELLED", "Leave Cancelled"

    ATTENDANCE_CHECK_IN = "ATTENDANCE_CHECK_IN", "Attendance Check In"
    ATTENDANCE_CHECK_OUT = "ATTENDANCE_CHECK_OUT", "Attendance Check Out"

    USER_CREATED = "USER_CREATED", "User Created"
    SYSTEM = "SYSTEM", "System Notification"