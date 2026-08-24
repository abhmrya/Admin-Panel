# from celery import shared_task
# from django.core.mail import send_mail

# from accounts.models import User


# @shared_task
# def send_test_email(user_id):
#     user = User.objects.get(id=user_id)

#     send_mail(
#         subject="Celery Test",
#         message=f"Hello {user.first_name}, Celery is working!",
#         from_email=None,
#         recipient_list=[user.email],
#     )