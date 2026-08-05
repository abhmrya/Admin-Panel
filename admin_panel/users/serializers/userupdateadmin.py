from rest_framework import serializers

from accounts.models import User
from accounts.choices import UserRole


class UserUpdateAdminSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


    # -----------------------------------
    # Role Validation
    # -----------------------------------
    def validate_role(self, value):

        request = self.context.get("request")

        if value not in UserRole.values:
            raise serializers.ValidationError(
                "Invalid role."
            )

        print(f'*****  role ******* {value}')
        print("Request User :", request.user.id)
        print("Editing User :", self.instance.id)
        print("Equal :", request.user == self.instance)
        print(request.user.email)
        print(self.instance.email)
          # Admin cannot change his own role
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

    
    # -----------------------------------
    # Username Validation
    # -----------------------------------
    def validate_username(self, value):

        value = value.strip()

        if len(value) < 3:
            
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )

        queryset = User.objects.filter(username=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    # -----------------------------------
    # First Name Validation
    # -----------------------------------
    def validate_first_name(self, value):

        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters."
            )

        return value

    # -----------------------------------
    # Last Name Validation
    # -----------------------------------
    def validate_last_name(self, value):

        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters."
            )

        return value

    # -----------------------------------
    # Email Validation
    # -----------------------------------
    def validate_email(self, value):

        value = value.strip().lower()

        queryset = User.objects.filter(email=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value



    # -----------------------------------
    # Object Validation
    # -----------------------------------
    def validate(self, attrs):

        request = self.context.get("request")

        if (
            self.instance
            and request
            and request.user == self.instance
            and attrs.get("is_active") is False
        ):
            raise serializers.ValidationError({
                "is_active": "You cannot deactivate your own account."
            })

        return attrs

    # -----------------------------------
    # Update User
    # -----------------------------------
    def update(self, instance, validated_data):

        request = self.context.get("request")

        instance.username = validated_data.get(
            "username",
            instance.username,
        )

        instance.first_name = validated_data.get(
            "first_name",
            instance.first_name,
        )

        instance.last_name = validated_data.get(
            "last_name",
            instance.last_name,
        )

        instance.email = validated_data.get(
            "email",
            instance.email,
        )

        instance.role = validated_data.get(
            "role",
            instance.role,
        )

        instance.is_active = validated_data.get(
            "is_active",
            instance.is_active,
        )

        if request:
            instance.updated_by = request.user

        instance.save()

        return instance