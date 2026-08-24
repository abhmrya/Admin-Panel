from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import json

from .models import UserProfile


User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=UserProfile)
def send_online_status(sender, instance, created, **kwargs):

    print(f'instance......',instance)
    print(f'created.......',created)
    print(sender)


    if not created:
        channel_layer = get_channel_layer()

        data = {
            "username": instance.user.username,
            "status": instance.online,
        }

        async_to_sync(channel_layer.group_send)(
            "online_users",
            {
                "type": "send_online_status",
                "value": json.dumps(data),
            }
        )

        print(
            f"Online status sent for "
            f"{instance.user.username}: {instance.online}"
        )

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):

    if created:
        UserProfile.objects.get_or_create(
            user=instance
        )