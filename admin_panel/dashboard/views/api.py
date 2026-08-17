from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from departments.models import Department
from leave.models import LeaveRequest


User = get_user_model()


class DashboardStatsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        today = timezone.localdate()

        thirty_days_ago = today - timedelta(days=30)

        data = {
            # =========================
            # USER / ROLE STATISTICS
            # =========================

            "users_count": User.objects.count(),

            "admins_count": User.objects.filter(
                role="ADMIN"
            ).count(),

            "hr_count": User.objects.filter(
                role="HR"
            ).count(),

            "managers_count": User.objects.filter(
                role="MANAGER"
            ).count(),

            "employees_count": User.objects.filter(
                role="EMPLOYEE"
            ).count(),

            # =========================
            # HR STATISTICS
            # =========================

            "departments_count": Department.objects.filter(
                is_active=True
            ).count(),

            "new_hires_count": User.objects.filter(
                role="EMPLOYEE",
                date_joined__date__gte=thirty_days_ago,
                is_active=True,
            ).count(),

            "on_leave_today": LeaveRequest.objects.filter(
                status=LeaveRequest.Status.APPROVED,
                start_date__lte=today,
                end_date__gte=today,
                user__role="EMPLOYEE",
                user__is_active=True,
            ).count(),

            "pending_leave_requests": LeaveRequest.objects.filter(
                status=LeaveRequest.Status.PENDING,
                user__role="EMPLOYEE",
                user__is_active=True,
            ).count(),
        }

        return Response(data)