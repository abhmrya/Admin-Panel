from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterService:

    @staticmethod
    def register(validated_data):

        validated_data.pop("confirm_password")

        return User.objects.create_user(**validated_data)