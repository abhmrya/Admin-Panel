from rest_framework.permissions import BasePermission

from accounts.choices import UserRole


class IsAdminOrHR(BasePermission):
    """
    Allow access to ADMIN and HR users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in {
                UserRole.ADMIN,
                UserRole.HR,
            }
        )


class IsAdminOrHROrManager(BasePermission):
    """
    Allow access to ADMIN, HR and MANAGER users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in {
                UserRole.ADMIN,
                UserRole.HR,
                UserRole.MANAGER,
            }
        )


class IsAdminOrManager(BasePermission):
    """
    Allow access to ADMIN and MANAGER users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in {
                UserRole.ADMIN,
                UserRole.MANAGER,
            }
        )


class IsAdminOrManagerOrEmployee(BasePermission):
    """
    Allow access to ADMIN, MANAGER and EMPLOYEE users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in {
                UserRole.ADMIN,
                UserRole.MANAGER,
                UserRole.EMPLOYEE,
            }
        )


class IsAdmin(BasePermission):
    """
    Allow access to ADMIN users only.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsHR(BasePermission):
    """
    Allow access to HR users only.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.HR
        )


class IsEmployee(BasePermission):
    """
    Allow access to EMPLOYEE users only.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.EMPLOYEE
        )


class IsManager(BasePermission):
    """
    Allow access to MANAGER users only.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.MANAGER
        )


class IsManagerOrEmployee(BasePermission):
    """
    Allow access to MANAGER and EMPLOYEE users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in {
                UserRole.MANAGER,
                UserRole.EMPLOYEE,
            }
        )