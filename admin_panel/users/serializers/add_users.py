import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.choices import UserRole


User = get_user_model()


class AddUserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        # min_length=8,
        max_length=20,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        # min_length=8,
        max_length=20,
    )

    class Meta:
        model = User

        fields = (
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "password",
            "confirm_password",
            "role",
        )

    # --------------------------------------------------
    # EMAIL
    # --------------------------------------------------

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    # --------------------------------------------------
    # USERNAME
    # --------------------------------------------------

    def validate_username(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username is required."
            )

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Username already exists."
            )

        if any(
            char.isupper()
            for char in value
        ):
            raise serializers.ValidationError(
                "Username must contain only lowercase letters."
            )

        return value

    # --------------------------------------------------
    # FIRST NAME
    # --------------------------------------------------

    def validate_first_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )

        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters."
            )

        if len(value) > 50:
            raise serializers.ValidationError(
                "First name must not exceed 50 characters."
            )

        if not re.fullmatch(
            r"[A-Za-z ]+",
            value
        ):
            raise serializers.ValidationError(
                "First name can contain only letters and spaces."
            )

        if any(
            char.isupper()
            for char in value
        ):
            raise serializers.ValidationError(
                "First name must contain only lowercase letters."
            )

        return value

    # --------------------------------------------------
    # PASSWORD + ROLE
    # --------------------------------------------------

    def validate(self, attrs):

        password = attrs.get("password")
        confirm_password = attrs.get(
            "confirm_password"
        )

        # Password confirmation

        if password != confirm_password:

            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })

        # --------------------------------------------------
        # WHO IS CREATING THE USER?
        # --------------------------------------------------

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authenticated user is required."
            )

        creator = request.user

        requested_role = attrs.get(
            "role"
        )

        # --------------------------------------------------
        # ADMIN
        # --------------------------------------------------

        if creator.role == UserRole.ADMIN:

            # ADMIN can create any role.

            return attrs

        # --------------------------------------------------
        # HR
        # --------------------------------------------------

        if creator.role == UserRole.HR:

            allowed_roles = {
                UserRole.EMPLOYEE,
                UserRole.MANAGER,
            }

            if requested_role not in allowed_roles:

                raise serializers.ValidationError({
                    "role":
                        "HR can create only EMPLOYEE or MANAGER users."
                })

            return attrs

        # --------------------------------------------------
        # EVERY OTHER ROLE
        # --------------------------------------------------

        raise serializers.ValidationError(
            "You do not have permission to create users."
        )

    # --------------------------------------------------
    # CREATE USER
    # --------------------------------------------------

    def create(self, validated_data):

        validated_data.pop(
            "confirm_password"
        )

        password = validated_data.pop(
            "password"
        )

        request = self.context.get(
            "request"
        )

        user = User.objects.create_user(
            password=password,
            created_by=request.user,
            **validated_data,
        )
        print("admin  add users: ",user)

        return user