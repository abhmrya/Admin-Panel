from django.conf import settings
from django.core.mail import send_mail


class EmailService:

    @staticmethod
    def send_registration_email(user):

        subject = "Welcome to Admin Panel"

        message = f"""
        Hello {user.first_name},

        Your account has been created successfully.

        Username:
        {user.username}

        Email:
        {user.email}

        Thank you.
        Admin Panel Team
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

    @staticmethod
    def send_password_reset_email(user, reset_link):

        subject = "Reset Your Password"

        message = f"""
        Hello {user.first_name},

        We received a request to reset your password.

        Click the link below to create a new password:

        {reset_link}

        This link is valid for a limited time.

        If you did not request a password reset, you can safely ignore this email.

        Thank you.
        Admin Panel Team
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )