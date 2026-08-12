from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.choices import UserRole

from ..models import LeaveApproval
from ..serializers import LeaveApprovalSerializer


class LeaveApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeaveApprovalSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    filter_backends = [
        DjangoFilterBackend,
    ]

    filterset_fields = [
        "leave_request",
        "approver",
        "action",
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = LeaveApproval.objects.select_related(
            "leave_request",
            "leave_request__user",
            "leave_request__leave_type",
            "approver",
        )

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            return queryset

        if user.role == UserRole.MANAGER:
            return queryset.filter(
                leave_request__user__manager=user
            )

        return queryset.filter(
            leave_request__user=user
        )