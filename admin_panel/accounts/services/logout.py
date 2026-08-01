from rest_framework import exceptions
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutService:

    @staticmethod
    def logout(refresh_token):

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

        except Exception:
            raise exceptions.ValidationError(
                {
                    "refresh": "Invalid or expired refresh token."
                }
            )