from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import LogoutSerializer
from accounts.services.logout import LogoutService
from django.contrib.auth import logout

class LogoutAPIView(APIView):

    def post(self, request):

        serializer = LogoutSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        LogoutService.logout(
            serializer.validated_data["refresh"],
        )

        logout(request)
        # Session expiry = Access token expiry
        # request.session.set_expiry(60)

        return Response(
            {
                "message": "Logout successful."
            },
            status=status.HTTP_200_OK,
        )