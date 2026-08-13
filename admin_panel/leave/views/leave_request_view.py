from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.choices import UserRole

from ..models import LeaveRequest
from ..permissions import (
    CanApproveLeave,
    IsOwnerOrAdminHR,
)
from ..serializers import LeaveRequestSerializer
from ..services import LeaveService


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer

    filter_backends = [
        DjangoFilterBackend,
    ]

    filterset_fields = [
        "leave_type",
        "status",
        "start_date",
        "end_date",
    ]

    def get_permissions(self):
        if self.action in [
            "approve",
            "reject",
        ]:
            return [
                IsAuthenticated(),
                CanApproveLeave(),
            ]

        return [
            IsAuthenticated(),
            IsOwnerOrAdminHR(),
        ]

    def get_queryset(self):
        user = self.request.user

        queryset = LeaveRequest.objects.select_related(
            "user",
            "leave_type",
            "reviewed_by",
        ).prefetch_related(
            "approvals__approver",
        )

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            return queryset

        if user.role == UserRole.MANAGER:
            return queryset.filter(
                user__manager=user
            )

        return queryset.filter(
            user=user
        )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        validated_data = serializer.validated_data

        leave_request = LeaveService.create_leave_request(
            user=request.user,
            leave_type=validated_data["leave_type"],
            start_date=validated_data["start_date"],
            end_date=validated_data["end_date"],
            day_type=validated_data["day_type"],
            reason=validated_data["reason"],
        )

        response_serializer = self.get_serializer(
            leave_request
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def approve(
        self,
        request,
        pk=None,
    ):
        leave_request = self.get_object()

        comment = request.data.get(
            "comment",
            "",
        )

        leave_request = LeaveService.approve_leave_request(
            leave_request=leave_request,
            reviewer=request.user,
            comment=comment,
        )

        serializer = self.get_serializer(
            leave_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def reject(
        self,
        request,
        pk=None,
    ):
        leave_request = self.get_object()

        rejection_reason = request.data.get(
            "rejection_reason",
            "",
        )

        leave_request = LeaveService.reject_leave_request(
            leave_request=leave_request,
            reviewer=request.user,
            rejection_reason=rejection_reason,
        )

        serializer = self.get_serializer(
            leave_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def cancel(
        self,
        request,
        pk=None,
    ):
        leave_request = self.get_object()

        leave_request = LeaveService.cancel_leave_request(
            leave_request=leave_request,
            user=request.user,
        )

        serializer = self.get_serializer(
            leave_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )