from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.choices import UserRole

from ..models import LeaveBalance
from ..permissions import IsAdminOrHR
from ..serializers import LeaveBalanceSerializer
from ..services import LeaveBalanceService

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveBalanceSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        "user",
        "leave_type",
        "year",
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = LeaveBalance.objects.select_related(
            "user",
            "leave_type",
        )

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            return queryset

        return queryset.filter(
            user=user
        )

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        validated_data = serializer.validated_data

        balance = LeaveBalanceService.create_balance(
            user=validated_data["user"],
            leave_type=validated_data["leave_type"],
            year=validated_data["year"],
            allocated_days=validated_data[
                "allocated_days"
            ],
        )

        response_serializer = self.get_serializer(
            balance
        )

        return Response(
            response_serializer.data,
            status=201,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop(
            "partial",
            False,
        )

        balance = self.get_object()

        serializer = self.get_serializer(
            balance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        allocated_days = serializer.validated_data.get(
            "allocated_days"
        )

        if allocated_days is None:
            raise ValidationError({
                "allocated_days": (
                    "Allocated days is required."
                )
            })

        balance = LeaveBalanceService.update_allocation(
            balance=balance,
            allocated_days=allocated_days,
        )

        response_serializer = self.get_serializer(
            balance
        )

        return Response(
            response_serializer.data
        )