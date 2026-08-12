from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.choices import UserRole

from ..services.leave_dashboard_service import (
    LeaveDashboardService,
)


class LeaveDashboardAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        user = request.user

        if user.role in [
            UserRole.ADMIN,
            UserRole.HR,
        ]:
            data = {
                "admin": (
                    LeaveDashboardService
                    .get_admin_summary()
                ),
            }

            return Response(
                data,
                status=status.HTTP_200_OK,
            )

        data = {
            "employee": (
                LeaveDashboardService
                .get_employee_summary(user)
            ),
        }

        if user.role == UserRole.MANAGER:
            data["manager"] = (
                LeaveDashboardService
                .get_manager_summary(user)
            )

        return Response(
            data,
            status=status.HTTP_200_OK,
        )