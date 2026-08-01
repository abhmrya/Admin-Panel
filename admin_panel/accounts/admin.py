from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "email",
        "username",
        "first_name",
        "role",
        "is_active",
        "is_verified",
        "is_staff",
        "date_joined",
    )

    list_filter = (
        "role",
        "is_active",
        "is_verified",
        "is_staff",
    )

    search_fields = (
        "email",
        "username",
        "first_name",
        "last_name",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "id",
        "date_joined",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "id",
                    "email",
                    "username",
                    "password",
                )
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                )
            },
        ),
        (
            "Role & Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "OAuth",
            {
                "fields": (
                    "google_id",
                    "github_id",
                    "linkedin_id",
                    "is_oauth_user",
                    "is_verified",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "created_by",
                    "updated_by",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "first_name",
                    "password1",
                    "password2",
                    "role",
                ),
            },
        ),
    )