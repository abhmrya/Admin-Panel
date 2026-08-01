import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager
from .choices import UserRole

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    username = models.CharField(
        max_length=150,
        unique=True,
    )

    first_name = models.CharField(
        max_length=100,
    )

    last_name = models.CharField(
        max_length=100,
        blank=True,
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
    )

    # OAuth Providers
    google_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    github_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    linkedin_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)

    is_verified = models.BooleanField(default=False)

    is_oauth_user = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_users",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_users",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username",
        "first_name",
    ]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email