from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserSerializer


class CurrentUserAPIView(APIView):

    def get(self, request):

        serializer = UserSerializer(
            request.user,
        )

        return Response(
            {
                "user": serializer.data,
            },
            status=status.HTTP_200_OK,
        )