from rest_framework.viewsets import ModelViewSet

from ..models import Department
from ..serializer.department import DepartmentSerializer
from rest_framework.permissions import IsAuthenticated

from audit.mixins import AuditMixin
from audit.constants import AuditAction

class AddDepartmentViewset(AuditMixin,ModelViewSet):
    """
    Dedicated ViewSet mapped to /api/v1/departments/add-departmet/
    Optimized specifically for quick department creation handling.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    # ==========================================================
    # AUDIT ACTIONS
    # ==========================================================

    audit_action_create = (AuditAction.DEPARTMENT_CREATED)

    audit_action_update = (AuditAction.DEPARTMENT_UPDATED)

    audit_action_delete = (AuditAction.DEPARTMENT_DELETED)