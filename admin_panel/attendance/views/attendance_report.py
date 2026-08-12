from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.serializers.attendance_report import (
    MonthlyAttendanceReportSerializer,
)

from attendance.services.attendance_report_service import (
    AttendanceReportService,
)


class MonthlyAttendanceReportAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        employee_id = request.query_params.get(
            "employee_id"
        )

        year = request.query_params.get(
            "year"
        )

        month = request.query_params.get(
            "month"
        )

        if not employee_id:
            return Response(
                {
                    "detail":
                        "employee_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not year:
            return Response(
                {
                    "detail":
                        "year is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not month:
            return Response(
                {
                    "detail":
                        "month is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            year = int(year)
            month = int(month)

        except ValueError:
            return Response(
                {
                    "detail":
                        "year and month must be integers."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Employee can only see own report.
        if (
            str(request.user.id)
            != str(employee_id)
            and request.user.role
            not in ["ADMIN", "HR"]
        ):
            return Response(
                {
                    "detail":
                        "You do not have permission "
                        "to view this attendance report."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            report = (
                AttendanceReportService
                .get_monthly_report(
                    employee_id=employee_id,
                    year=year,
                    month=month,
                )
            )

        except ValueError as exc:

            return Response(
                {
                    "detail": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = (
            MonthlyAttendanceReportSerializer(
                report
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )