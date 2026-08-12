from accounts.models import User
from attendance.models import Attendance
from departments.models import Department

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

    
}