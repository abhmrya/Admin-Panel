from accounts.models import User
from attendance.models import Attendance
from departments.models import Department
from leave.models import LeaveApproval, LeaveRequest

AUDIT_FIELDS = {

    # ==========================================================
    # USER
    # ==========================================================

    User: [

        "id",

        "username",

        "first_name",

        "last_name",

        "email",

        "phone_number",

        "role",

        "is_active",

        "created_at",

        "updated_at",

    ],


    # ==========================================================
    # ATTENDANCE
    # ==========================================================

    Attendance: [

        "id",

        "employee_id",

        "date",

        "check_in",

        "check_out",

        "status",

        "working_minutes",

        "created_at",

        "updated_at",

    ],

    Department: [
        "id",
        "name",
        "description",
        "is_active",
        "created_at",
        "updated_at",
    ],

    # ==========================================================
    # LEAVE REQUEST
    # ==========================================================

    LeaveRequest: [
        "id",
        "user_id",
        "leave_type_id",
        "start_date",
        "end_date",
        "day_type",
        "total_days",
        "reason",
        "status",
        "reviewed_by_id",
        "reviewed_at",
        "rejection_reason",
        "created_at",
        "updated_at",
    ],


    # ==========================================================
    # LEAVE APPROVAL
    # ==========================================================

    LeaveApproval: [
        "id",
        "leave_request_id",
        "approver_id",
        "action",
        "comment",
        "created_at",
        "updated_at",
    ],

    
}