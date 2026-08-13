from rest_framework import viewsets
from rest_framework.permissions  import IsAuthenticated
from ..models import LeaveType
from ..permissions import IsAdminOrHR
from ..serializers import LeaveTypeSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

    def get_queryset(self):
        if self.action == "list":
            return LeaveType.objects.filter(is_active=True)

        return LeaveType.objects.all()

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminOrHR]

        return [permission() for permission in permission_classes]