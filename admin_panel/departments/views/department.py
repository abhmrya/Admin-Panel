from rest_framework.viewsets import ModelViewSet

from ..models import Department
from ..serializer.department import DepartmentSerializer
from rest_framework.permissions import IsAuthenticated

class DepartmentViewSet(ModelViewSet):

    queryset = Department.objects.all().order_by("-created_at")

    serializer_class = DepartmentSerializer
