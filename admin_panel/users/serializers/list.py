from rest_framework import serializers

from accounts.models import User


class UserListSerializer(serializers.ModelSerializer):

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