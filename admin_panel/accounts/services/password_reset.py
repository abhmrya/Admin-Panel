from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)
from django.utils.translation import gettext_lazy as _

from accounts.tasks import send_password_reset_email_task


User = get_user_model()


class PasswordResetService:

    @staticmethod
    def request_password_reset(email):

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if not user:
            return

        token = PasswordResetTokenGenerator().make_token(
            user
        )

        uid = urlsafe_base64_encode(
            str(user.pk).encode()
        )

        reset_link = (
            f"http://127.0.0.1:8000/"
            f"reset-password/{uid}/{token}/"
        )

        send_password_reset_email_task.delay(
            user.id,
            reset_link,
        )

    @staticmethod
    def reset_password(
        uid,
        token,
        new_password,
    ):

        try:

            user_id = force_str(
                urlsafe_base64_decode(uid)
            )

            user = User.objects.get(
                pk=user_id,
                is_active=True,
            )

        except (
            User.DoesNotExist,
            ValueError,
            TypeError,
            OverflowError,
        ):

            raise ValidationError(
                _("Invalid password reset link.")
            )

        token_generator = PasswordResetTokenGenerator()

        if not token_generator.check_token(
            user,
            token,
        ):

            raise ValidationError(
                _("Invalid or expired password reset link.")
            )

        user.set_password(
            new_password
        )

        user.save(
            update_fields=[
                "password",
                "updated_at",
            ]
        )

        return user