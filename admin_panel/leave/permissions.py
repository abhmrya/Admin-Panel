from rest_framework.permissions import BasePermission

from accounts.choices import UserRole


class IsAdminOrHR(BasePermission):
    """
    Only Admin and HR can manage leave configuration
    and perform administrative leave operations.
    """

    message = (
        "Only Admin or HR can perform this action."
    )

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in [
                UserRole.ADMIN,
                UserRole.HR,
            ]
        )


class IsOwnerOrAdminHR(BasePermission):
    """
    Admin/HR can access all objects.
    Employee can access only their own objects.
    Manager can access their own team objects.
    """

    message = (
        "You are not authorized to access this object."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            return True

        if user.role == UserRole.MANAGER:
            return obj.user.manager_id == user.id

        return obj.user == user


class CanApproveLeave(BasePermission):
    """
    Admin and HR can approve/reject any leave request.

    Manager can approve/reject only leave requests
    belonging to their own team.

    Employee cannot approve/reject leave requests.
    """

    message = (
        "You are not authorized to approve or reject "
        "this leave request."
    )

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.role in [
            UserRole.ADMIN,
            UserRole.HR,
            UserRole.MANAGER,
        ]

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            return True

        if user.role == UserRole.MANAGER:
            return obj.user.manager_id == user.id

        return False