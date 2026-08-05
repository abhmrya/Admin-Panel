from rest_framework.permissions import BasePermission
from accounts.choices import UserRole


class IsAdmin(BasePermission):

    message = "Only admin users can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )