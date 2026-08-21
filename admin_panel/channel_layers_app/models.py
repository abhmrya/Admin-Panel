from django.db import models
from django.conf import settings


class Group_name(models.Model):
    groupname = models.CharField(max_length=100)

    def __str__(self):
        return str(self.groupname)


class Chat_msg(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    group = models.ForeignKey(
        Group_name,
        on_delete=models.CASCADE
    )

    message = models.CharField(max_length=1000)

    time = models.DateTimeField(auto_now=True)

    audio = models.FileField(
        upload_to="voice_messages/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} in {self.group.groupname}"


class OneToOneMessage(models.Model):
    send_from = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_messages",
        on_delete=models.CASCADE
    )

    send_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_messages",
        on_delete=models.CASCADE
    )

    message = models.CharField(max_length=1000)

    time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"From: {self.send_from.username}, "
            f"To: {self.send_to.username}, "
            f"Message: {self.message}"
        )

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
        # related_name hata diya -> ab default "userprofile" milega
    )

    online = models.BooleanField(default=False)

    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.email} - {'Online' if self.online else 'Offline'}"