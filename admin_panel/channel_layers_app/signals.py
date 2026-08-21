# signals.py
from django.db.models.signals import post_save
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from .models import UserProfile

# ---------------------------------------------------
# 1️⃣ Create and save UserProfile automatically
# ---------------------------------------------------

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create UserProfile when a new User is created"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when a User is saved"""
    instance.userprofile.save()

# ---------------------------------------------------
# 2️⃣ Send welcome email when a user registers
# ---------------------------------------------------

# @receiver(post_save, sender=User)
# def send_welcome_email(sender, instance, created, **kwargs):
#     """Send welcome email on user registration"""
#     if created:
#         subject = "Welcome to Our Site!"
#         message = f"Hello {instance.username}, thanks for registering!"
#         recipient_list = [instance.email]
#         send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
#         print(f"Welcome email sent to {instance.email}")

# # ---------------------------------------------------
# # 3️⃣ Send login email when a user logs in
# # ---------------------------------------------------

# @receiver(user_logged_in)
# def send_login_email(sender, request, user, **kwargs):
#     """Send email when user logs in"""
#     subject = "Welcome Back!"
#     message = f"Hello {user.username}, you have successfully logged in!"
#     recipient_list = [user.email]
#     send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
#     print(f"Login email sent to {user.email}")

# ---------------------------------------------------
# 4️⃣ Send online status updates via channels
# ---------------------------------------------------

@receiver(post_save, sender=UserProfile)
def send_online_status(sender, instance, created, **kwargs):
    """Send online status update to WebSocket group when UserProfile changes"""
    if not created:
        channel_layer = get_channel_layer()
        data = {
            'username': instance.user.username,
            'status': instance.online
        }
        async_to_sync(channel_layer.group_send)(
            'online_users',
            {
                'type': 'send_onlineStatus',
                'value': json.dumps(data)
            }
        )
        print(f"*********Online status sent for {instance.user.username}: {instance.online}")
