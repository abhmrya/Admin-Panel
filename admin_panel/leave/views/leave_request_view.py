from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.choices import UserRole
from ..models import LeaveRequest
from ..permissions import CanApproveLeave, IsOwnerOrAdminHR
from ..serializers import LeaveRequestSerializer
from ..services import LeaveService
from audit.constants import AuditAction
from audit.mixins import AuditMixin
from audit.services import AuditService
from ..serializers import LeaveHistorySerializer

class LeaveRequestViewSet(AuditMixin, viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["leave_type", "status", "start_date", "end_date"]

    def get_permissions(self):
        if self.action in ["approve", "reject"]:
            return [IsAuthenticated(), CanApproveLeave()]
        return [IsAuthenticated(), IsOwnerOrAdminHR()]

    def get_queryset(self):
        user = self.request.user
        queryset = LeaveRequest.objects.select_related(
            "user", "leave_type", "reviewed_by"
        ).prefetch_related("approvals__approver")

        if user.role in [UserRole.ADMIN, UserRole.HR]:
            return queryset
        if user.role == UserRole.MANAGER:
            return queryset.filter(user__manager=user)
        return queryset.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        leave_request = LeaveService.create_leave_request(
            user=request.user,
            leave_type=data["leave_type"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            day_type=data["day_type"],
            reason=data["reason"],
        )


        return Response(
            self.get_serializer(leave_request).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        leave_request = LeaveService.approve_leave_request(
            leave_request=leave_request,
            reviewer=request.user,
            comment=request.data.get("comment", ""),
        )
        return Response(self.get_serializer(leave_request).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        leave_request = LeaveService.reject_leave_request(
            leave_request=leave_request,
            reviewer=request.user,
            rejection_reason=request.data.get("rejection_reason", ""),
        )
        return Response(self.get_serializer(leave_request).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        leave_request = self.get_object()
        leave_request = LeaveService.cancel_leave_request(
            leave_request=leave_request,
            user=request.user,
        )
        return Response(self.get_serializer(leave_request).data)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        queryset = self.filter_queryset(
            self.get_queryset().exclude(status=LeaveRequest.Status.PENDING)
        )
        return Response(LeaveHistorySerializer(queryset, many=True).data)