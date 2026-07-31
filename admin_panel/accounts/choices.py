from django.db import models

class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    HR = "HR", "HR"
    EMPLOYEE = "EMPLOYEE", "Employee"