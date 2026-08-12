from rest_framework.viewsets import ModelViewSet

from ..models import Department
from ..serializer.department import DepartmentSerializer
from rest_framework.permissions import IsAuthenticated

from audit.mixins import AuditMixin
from audit.constants import AuditAction

class DepartmentViewSet(AuditMixin,ModelViewSet):

    queryset = Department.objects.all().order_by("-created_at")

    serializer_class = DepartmentSerializer

    # ==========================================================
    # AUDIT ACTIONS
    # ==========================================================

    audit_action_create = (AuditAction.DEPARTMENT_CREATED)

    audit_action_update = (AuditAction.DEPARTMENT_UPDATED)

    audit_action_delete = (AuditAction.DEPARTMENT_DELETED)
