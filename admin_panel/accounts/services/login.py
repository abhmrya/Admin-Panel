from django.contrib.auth import authenticate
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import RefreshToken


class LoginService:

    @staticmethod
    def login(email, password):

        user = authenticate(
            username=email,
            password=password,
        )

        if user is None:
            raise exceptions.AuthenticationFailed(
                "Invalid email or password."
            )

        if not user.is_active:
            raise exceptions.AuthenticationFailed(
                "Your account is inactive."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }