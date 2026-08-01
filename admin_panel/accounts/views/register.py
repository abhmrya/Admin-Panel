from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import RegisterSerializer
from accounts.services.register import RegisterService
from accounts.services.email import EmailService
from accounts.tasks import send_registration_email_task

class RegisterAPIView(APIView):

    permission_classes = [AllowAny]


    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )


        user = RegisterService.register(
            serializer.validated_data
        )


        send_registration_email_task.delay(user.id,)


        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )