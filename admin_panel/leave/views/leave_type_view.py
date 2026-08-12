from rest_framework import viewsets

from ..models import LeaveType
from ..permissions import IsAdminOrHR
from ..serializers import LeaveTypeSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAdminOrHR]