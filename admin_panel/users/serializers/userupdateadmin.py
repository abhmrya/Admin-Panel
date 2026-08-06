from rest_framework import serializers

from accounts.models import User
from accounts.choices import UserRole
from departments.models import Department
from profiles.models import Profile


class UserUpdateAdminSerializer(serializers.ModelSerializer):

    department = serializers.PrimaryKeyRelatedField(
        source="profile.department",
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )


    class Meta:

        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "department",
            "is_active",
            "created_at",
        ]


        read_only_fields = [
            "id",
            "created_at",
        ]



    # -----------------------------
    # Role Validation
    # -----------------------------

    def validate_role(self, value):

        request = self.context.get("request")

        if value not in UserRole.values:
            raise serializers.ValidationError(
                "Invalid role."
            )


        if (
            self.instance
            and request
            and request.user == self.instance
            and value != self.instance.role
        ):
            raise serializers.ValidationError(
                "You cannot change your own role."
            )


        return value



    # -----------------------------
    # Username Validation
    # -----------------------------

    def validate_username(self, value):

        value = value.strip()


        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )


        users = User.objects.filter(
            username=value
        )


        if self.instance:
            users = users.exclude(
                id=self.instance.id
            )


        if users.exists():
            raise serializers.ValidationError(
                "Username already exists."
            )


        return value



    # -----------------------------
    # Email Validation
    # -----------------------------

    def validate_email(self, value):

        value = value.strip().lower()


        users = User.objects.filter(
            email=value
        )


        if self.instance:
            users = users.exclude(
                id=self.instance.id
            )


        if users.exists():
            raise serializers.ValidationError(
                "Email already exists."
            )


        return value



    # -----------------------------
    # Object Validation
    # -----------------------------

    def validate(self, attrs):

        request = self.context.get("request")


        if (
            self.instance
            and request
            and request.user == self.instance
            and attrs.get("is_active") is False
        ):

            raise serializers.ValidationError({
                "is_active":
                "You cannot deactivate your own account."
            })


        return attrs



    # -----------------------------
    # Update
    # -----------------------------


    def update(self, instance, validated_data):

        request = self.context.get("request")

        profile_data = validated_data.pop("profile", {})

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if request:
            instance.updated_by = request.user

        instance.save()

        if profile_data:

            profile, created = Profile.objects.get_or_create(
                user=instance
            )

            profile.department = profile_data.get(
                "department",
                profile.department
            )

            profile.save()

        return instance