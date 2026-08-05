from accounts.models import User


AUDIT_FIELDS = {

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

}