from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import LoginSerializer,UserSerializer
from accounts.services.login import LoginService
from django.contrib.auth import login

from rest_framework.throttling import UserRateThrottle
from common.throttles import LoginThrottle
# from common.tasks import send_test_email
class LoginAPIView(APIView):
    """
    
    """
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    # throttle_classes = [UserRateThrottle]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        data = LoginService.login(
            **serializer.validated_data,
        )

        user = data["user"]

        login(request,user)

        ''' 
        every 10 secound send email for testing
        '''

        # send_test_email.delay(user.id)

        return Response(
            {
                "message": "Login successful.",
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": data["access"],
                    "refresh": data["refresh"],
                },
            },
            status=status.HTTP_200_OK,
        )