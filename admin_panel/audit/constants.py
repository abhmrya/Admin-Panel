from django.db import models


class AuditAction(models.TextChoices):

    # ==========================================================
    # USER ACTIONS
    # ==========================================================

    USER_CREATED = "USER_CREATED", "User Created"

    USER_UPDATED = "USER_UPDATED", "User Updated"

    USER_DELETED = "USER_DELETED", "User Deleted"


    # ==========================================================
    # AUTHENTICATION ACTIONS
    # ==========================================================

    LOGIN_SUCCESS = "LOGIN_SUCCESS", "Login Success"

    LOGIN_FAILED = "LOGIN_FAILED", "Login Failed"

    LOGOUT = "LOGOUT", "Logout"


    # ==========================================================
    # ATTENDANCE ACTIONS
    # ==========================================================

    ATTENDANCE_CREATED = ("ATTENDANCE_CREATED", "Attendance Created",)

    ATTENDANCE_UPDATED = ("ATTENDANCE_UPDATED", "Attendance Updated",)

    ATTENDANCE_DELETED = ("ATTENDANCE_DELETED", "Attendance Deleted",)

    ATTENDANCE_CHECK_IN = ("ATTENDANCE_CHECK_IN", "Attendance Check In",)

    ATTENDANCE_CHECK_OUT = ("ATTENDANCE_CHECK_OUT", "Attendance Check Out",)

    # ==========================================================
    # DEPARTMET ACTIONS
    # ==========================================================


    DEPARTMENT_CREATED = ("DEPARTMENT_CREATED", "Department Created",)

    DEPARTMENT_UPDATED = ("DEPARTMENT_UPDATED", "Department Updated",)

    DEPARTMENT_DELETED = ("DEPARTMENT_DELETED", "Department Deleted",)