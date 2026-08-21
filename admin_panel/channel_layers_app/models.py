from django.db import models
from django.contrib.auth.models import User

# Create your models here.


# from django.contrib.auth.models import AbstractUser

# class CustomUser(AbstractUser):
#     is_online = models.BooleanField(default=False)  



class Group_name(models.Model):
    groupname = models.CharField(max_length=100)

    def __str__(self):
        return str(self.groupname)

class Chat_msg(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group_name, on_delete=models.CASCADE)
    message = models.CharField(max_length=1000)
    time = models.DateTimeField(auto_now=True)
    audio = models.FileField(upload_to="voice_messages/", blank=True, null=True)  # ✅ for audio
   

    def __str__(self):
        return f"{self.user.username} in {self.group.groupname}"
    
from django.db import models
from django.contrib.auth.models import User

class OneToOneMessage(models.Model):
    send_from = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    send_to = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message = models.CharField(max_length=1000)
    time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"From: {self.send_from.username}, To: {self.send_to.username}, Message: {self.message}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    online = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to="profiles/", default="profiles/nonprofile.png")  # ✅ profile image


    # def __str__(self):
    #     return f"{self.user.username} - {'Online' if self.online else 'Offline'}"