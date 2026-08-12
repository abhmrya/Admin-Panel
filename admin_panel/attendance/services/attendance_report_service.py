from calendar import monthrange
from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Sum

from attendance.models import (
    Attendance,
    AttendanceStatus,
)


User = get_user_model()


class AttendanceReportService:

    @staticmethod
    def get_monthly_report(
        employee_id,
        year,
        month,
    ):
        """
        Generate monthly attendance report
        for a single employee.
        """

        AttendanceReportService._validate_month(
            year,
            month,
        )

        employee = (
            User.objects
            .filter(id=employee_id)
            .first()
        )

        if not employee:
            raise ValueError(
                "Employee not found."
            )

        start_date = date(
            year,
            month,
            1,
        )

        last_day = monthrange(
            year,
            month,
        )[1]

        end_date = date(
            year,
            month,
            last_day,
        )

        records = (
            Attendance.objects
            .filter(
                employee=employee,
                date__range=(
                    start_date,
                    end_date,
                ),
            )
            .order_by("date")
        )

        summary = (
            AttendanceReportService
            ._build_summary(records)
        )

        employee_data = (
            AttendanceReportService
            ._build_employee_data(employee)
        )

        return {
            "employee": employee_data,
            "period": {
                "year": year,
                "month": month,
            },
            "summary": summary,
            "records": records,
        }

    @staticmethod
    def _build_employee_data(employee):
        full_name = " ".join(
            filter(
                None,
                [
                    employee.first_name,
                    employee.last_name,
                ],
            )
        )

        name = (
            full_name
            or getattr(
                employee,
                "username",
                None,
            )
            or employee.email
        )

        return {
            "id": employee.id,
            "name": name,
            "email": employee.email,
        }

    @staticmethod
    def _build_summary(records):

        present = 0
        absent = 0
        half_day = 0
        on_leave = 0

        total_working_minutes = 0

        for record in records:

            if record.status == (
                AttendanceStatus.PRESENT
            ):
                present += 1

            elif record.status == (
                AttendanceStatus.ABSENT
            ):
                absent += 1

            elif record.status == (
                AttendanceStatus.HALF_DAY
            ):
                half_day += 1

            elif record.status == (
                AttendanceStatus.ON_LEAVE
            ):
                on_leave += 1

            total_working_minutes += (
                record.working_minutes or 0
            )

        total_working_hours = (
            AttendanceReportService
            ._format_minutes(
                total_working_minutes
            )
        )

        return {
            "present": present,
            "absent": absent,
            "half_day": half_day,
            "on_leave": on_leave,
            "total_working_minutes":
                total_working_minutes,
            "total_working_hours":
                total_working_hours,
        }

    @staticmethod
    def _format_minutes(minutes):

        minutes = int(minutes or 0)

        hours = minutes // 60

        remaining_minutes = (
            minutes % 60
        )

        return (
            f"{hours}h "
            f"{remaining_minutes}m"
        )

    @staticmethod
    def _validate_month(year, month):

        if month < 1 or month > 12:
            raise ValueError(
                "Month must be between 1 and 12."
            )

        if year < 2000:
            raise ValueError(
                "Invalid year."
            )