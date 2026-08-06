from rest_framework import serializers

from accounts.models import User


class UserListSerializer(serializers.ModelSerializer):

    department = serializers.SerializerMethodField()


    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "email",
            "role",
            "department",
            "is_active",
            "created_at",
        ]


    def get_department(self, obj):

        if hasattr(obj, "profile") and obj.profile.department:

            return {
                "id": obj.profile.department.id,
                "name": obj.profile.department.name,
                "code": obj.profile.department.code,
            }

        return None