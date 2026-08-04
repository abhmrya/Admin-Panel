from rest_framework import serializers
from ..models import Profile


class ProfileSerializer(serializers.ModelSerializer):

    user_data = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "id",
            "avatar",
            "gender",
            "dob",
            "address",
            "user_data",
        )
        read_only_fields = ("user",)

    def get_user_data(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "phone_number": obj.user.phone_number,
            "role": obj.user.role,
        }

    def update(self, instance, validated_data):

        user = instance.user

        user.first_name = self.initial_data.get(
            "first_name",
            user.first_name,
        )

        user.last_name = self.initial_data.get(
            "last_name",
            user.last_name,
        )

        user.phone_number = self.initial_data.get(
            "phone_number",
            user.phone_number,
        )

        user.save()

        instance.gender = validated_data.get(
            "gender",
            instance.gender,
        )

        instance.dob = validated_data.get(
            "dob",
            instance.dob,
        )

        instance.address = validated_data.get(
            "address",
            instance.address,
        )

        instance.avatar = validated_data.get(
            "avatar",
            instance.avatar,
        )

        instance.save()

        return instance