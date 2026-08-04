from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()
import re

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
        )

        extra_kwargs = {
            "password": {
                "write_only": True,
            }
        }
    def validate_username(self,value):
        if any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "First name must contain only lowercase letters."
            )
        return value

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

        if not re.fullmatch(r"[A-Za-z ]+", value):
            raise serializers.ValidationError(
                "First name can contain only letters and spaces."
            )

        if any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "First name must contain only lowercase letters."
            )
        return value

        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )
        return attrs