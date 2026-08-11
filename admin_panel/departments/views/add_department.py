from rest_framework.viewsets import ModelViewSet

from ..models import Department
from ..serializer.department import DepartmentSerializer
from rest_framework.permissions import IsAuthenticated


class AddDepartmentViewset(ModelViewSet):
    """
    Dedicated ViewSet mapped to /api/v1/departments/add-departmet/
    Optimized specifically for quick department creation handling.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]