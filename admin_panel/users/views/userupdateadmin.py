from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from ..serializers.userupdateadmin import UserUpdateAdminSerializer
from users.permissions import IsAdmin

class UserUpdateAdminViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by("-created_at")

    serializer_class = UserUpdateAdminSerializer

    permission_classes = [
        IsAdmin
    ]