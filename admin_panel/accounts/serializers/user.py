from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.choices import UserRole


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "manager",
        )

    def validate_manager(self, manager):
        if manager is None:
            return manager

        if manager.role != UserRole.MANAGER:
            raise serializers.ValidationError(
                "Selected user must have MANAGER role."
            )

        if not manager.is_active:
            raise serializers.ValidationError(
                "Selected manager is inactive."
            )

        if self.instance and manager.pk == self.instance.pk:
            raise serializers.ValidationError(
                "A user cannot be their own manager."
            )

        return manager