from rest_framework import serializers

from accounts.models import User


class UserDetailSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [

            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "role",
            "is_active",
            "is_verified",
            "is_oauth_user",
            "date_joined",
            "created_at",
            "updated_at",

        ]