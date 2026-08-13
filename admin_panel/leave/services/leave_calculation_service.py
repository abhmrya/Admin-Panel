from datetime import timedelta

from ..models import Holiday, LeaveRequest


class LeaveCalculationService:

    @staticmethod
    def calculate_working_days(
        start_date,
        end_date,
        day_type=LeaveRequest.DayType.FULL_DAY,
    ):
        if start_date > end_date:
            raise ValueError(
                "Start date must be before or equal to end date."
            )

        holidays = set(
            Holiday.objects.filter(
                date__range=[
                    start_date,
                    end_date,
                ],
                is_active=True,
                is_optional=False,
            ).values_list(
                "date",
                flat=True,
            )
        )

        total_days = 0
        current_date = start_date

        while current_date <= end_date:

            is_weekend = current_date.weekday() >= 5
            is_holiday = current_date in holidays

            if not is_weekend and not is_holiday:
                total_days += 1

            current_date += timedelta(days=1)

        if day_type == LeaveRequest.DayType.HALF_DAY:

            if start_date != end_date:
                raise ValueError(
                    "Half day leave must be for one day."
                )

            if total_days != 1:
                raise ValueError(
                    "Half day leave must be on "
                    "a working day."
                )

            return 0.5

        return total_days