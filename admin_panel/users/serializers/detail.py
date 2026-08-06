from rest_framework import serializers

from accounts.models import User


class UserDetailSerializer(serializers.ModelSerializer):

    department = serializers.SerializerMethodField()


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
            "department",
            "is_active",
            "is_verified",
            "is_oauth_user",
            "date_joined",
            "created_at",
            "updated_at",
        ]


    def get_department(self, obj):

        profile = getattr(obj, "profile", None)

        if profile and profile.department:

            return {
                "id": profile.department.id,
                "name": profile.department.name,
                "code": profile.department.code,
            }

        return None