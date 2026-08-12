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

from audit.mixins import AuditMixin
from audit.constants import AuditAction


class AttendanceViewSet(AuditMixin, viewsets.ModelViewSet):
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

    audit_action_create = AuditAction.ATTENDANCE_CREATED
    audit_action_update = AuditAction.ATTENDANCE_UPDATED
    audit_action_delete = AuditAction.ATTENDANCE_DELETED

    def get_permissions(self):
        admin_hr_actions = {
            "create",
            "update",
            "partial_update",
            "destroy",
        }

        if self.action in admin_hr_actions:
            return [IsAuthenticated(), IsAdminOrHR()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        queryset = Attendance.objects.select_related("employee").order_by("-date", "-created_at")

        if user.is_superuser or user.role in {UserRole.ADMIN, UserRole.HR}:
            pass
        else:
            queryset = queryset.filter(employee=user)

        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if year:
            try:
                year = int(year)
            except ValueError:
                raise ValidationError({
                    "year": "Year must be a valid number."
                })

            if year < 2000 or year > 2100:
                raise ValidationError({
                    "year": "Year must be between 2000 and 2100."
                })

            queryset = queryset.filter(date__year=year)

        if month:
            try:
                month = int(month)
            except ValueError:
                raise ValidationError({
                    "month": "Month must be a valid number."
                })

            if month < 1 or month > 12:
                raise ValidationError({
                    "month": "Month must be between 1 and 12."
                })

            queryset = queryset.filter(date__month=month)

        return queryset

    @action(detail=False, methods=["post"], url_path="check-in")
    def check_in(self, request):
        try:
            attendance = AttendanceService.check_in(request.user)
            serializer = self.get_serializer(attendance)

            return Response({
                "message": "Checked in successfully.",
                "data": serializer.data,
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["post"], url_path="check-out")
    def check_out(self, request):
        try:
            attendance = AttendanceService.check_out(request.user)
            serializer = self.get_serializer(attendance)

            return Response({
                "message": "Checked out successfully.",
                "data": serializer.data,
            }, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)