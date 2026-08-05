from django.db import models


class AuditAction(models.TextChoices):

    USER_CREATED = "USER_CREATED", "User Created"

    USER_UPDATED = "USER_UPDATED", "User Updated"

    USER_DELETED = "USER_DELETED", "User Deleted"

    LOGIN_SUCCESS = "LOGIN_SUCCESS", "Login Success"

    LOGIN_FAILED = "LOGIN_FAILED", "Login Failed"

    LOGOUT = "LOGOUT", "Logout"