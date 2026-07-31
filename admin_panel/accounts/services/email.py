from django.core.mail import send_mail
from django.conf import settings



class EmailService:


    @staticmethod
    def send_registration_email(user):

        subject="Welcome to Admin Panel"


        message=f"""
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