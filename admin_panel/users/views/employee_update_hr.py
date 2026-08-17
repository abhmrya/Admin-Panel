from rest_framework import viewsets

from accounts.models import User
from ..serializers.employee_update_hr import EmployeeUpdateHrSerializer
from common.permission import IsHR
from audit.constants import AuditAction
from audit.mixins import AuditMixin
from accounts.choices import UserRole


class Employee_Update_Hr_ViewSet(AuditMixin, viewsets.ModelViewSet):

    queryset = User.objects.exclude(role = UserRole.ADMIN).order_by("-created_at")

    serializer_class = EmployeeUpdateHrSerializer

    permission_classes = [
        IsHR
    ]

    audit_action_create = AuditAction.USER_CREATED
    audit_action_update = AuditAction.USER_UPDATED
    audit_action_delete = AuditAction.USER_DELETED

    def get_user_data(self, user):
        return {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        }