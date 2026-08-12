from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import LeavePolicy
from ..permissions import IsAdminOrHR
from ..serializers import LeavePolicySerializer


class LeavePolicyViewSet(viewsets.ModelViewSet):
    queryset = LeavePolicy.objects.select_related(
        "leave_type"
    )

    serializer_class = LeavePolicySerializer

    filter_backends = [
        DjangoFilterBackend,
    ]

    filterset_fields = [
        "leave_type",
        "is_active",
    ]

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [
                IsAuthenticated(),
                IsAdminOrHR(),
            ]

        return [
            IsAuthenticated(),
        ]