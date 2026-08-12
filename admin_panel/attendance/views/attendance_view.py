from django.core.exceptions import ValidationError

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.choices import UserRole
from common.permission import IsAdminOrHR

from ..models import Attendance
from ..serializers.attendance import AttendanceSerializer
from ..services.attendance_service import AttendanceService


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    Attendance API.

    Permissions:
    - Admin / HR:
        View all attendance
        Edit attendance
        Delete attendance
        Create attendance

    - Employee / Manager:
        View only own attendance
        Check-in
        Check-out
    """

    serializer_class = AttendanceSerializer

    def get_permissions(self):
        """
        Apply role-based permissions according to action.
        """

        admin_hr_actions = {
            "create",
            "update",
            "partial_update",
            "destroy",
        }

        if self.action in admin_hr_actions:
            return [
                IsAuthenticated(),
                IsAdminOrHR(),
            ]

        return [
            IsAuthenticated(),
        ]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Attendance.objects
            .select_related("employee")
            .order_by("-date", "-created_at")
        )

        # Admin and HR can see everything
        if (
            user.is_superuser
            or user.role in {
                UserRole.ADMIN,
                UserRole.HR,
            }
        ):
            return queryset

        # Employees / managers can see only their own records
        return queryset.filter(employee=user)

    @action(
        detail=False,
        methods=["post"],
        url_path="check-in",
    )
    def check_in(self, request):
        try:
            attendance = AttendanceService.check_in(
                request.user
            )

            serializer = self.get_serializer(
                attendance
            )

            return Response(
                {
                    "message": "Checked in successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            return Response(
                {
                    "detail": e.message,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "detail": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=False,
        methods=["post"],
        url_path="check-out",
    )
    def check_out(self, request):
        try:
            attendance = AttendanceService.check_out(
                request.user
            )

            serializer = self.get_serializer(
                attendance
            )

            return Response(
                {
                    "message": "Checked out successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "detail": e.message,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "detail": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )