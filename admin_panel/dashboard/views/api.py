from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardStatsAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        data = {

            "users_count": User.objects.count(),

            "admins_count": User.objects.filter(role="ADMIN").count(),

            "hr_count": User.objects.filter(role="HR").count(),

            "managers_count": User.objects.filter(role="MANAGER").count(),

            "employees_count": User.objects.filter(role="EMPLOYEE").count(),

        }
        print(f'dashboard data: {data}')

        return Response(data)