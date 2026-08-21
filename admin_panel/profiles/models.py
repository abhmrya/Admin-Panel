from django.db import models
from accounts.models import User
from departments.models import Department

class Gender(models.TextChoices):
    MALE = "MALE", "Male"
    FEMALE = "FEMALE", "Female"
    OTHER = "OTHER", "Other"


class Profile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )

    avatar = models.ImageField(
        upload_to="profile/",
        default="profiles/nonprofiles.png",
        blank=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
        null=True
    )

    dob = models.DateField(
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )


    def __str__(self):
        return self.user.email