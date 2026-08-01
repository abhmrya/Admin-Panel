from rest_framework.views import APIView
from rest_framework.response import Response


class DashboardStatsAPIView(APIView):

    def get(self, request):

        return Response({

            "users":120,
            "orders":350,
            "revenue":50000

        })