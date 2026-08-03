import uuid

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.exceptions import GoogleAuthError

from accounts.serializers.google_login import GoogleLoginSerializer
from accounts.services.google_login import verify_google_token
from accounts.models import User


class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payload = verify_google_token(serializer.validated_data["credential"])

            print(f"pyload : {payload}")
        except GoogleAuthError:
            return Response({"detail": "Invalid Google token."}, status=400)
        except Exception:
            return Response({"detail": "Google authentication failed."}, status=400)

        if not payload.get("email_verified"):
            return Response({"detail": "Google email is not verified."}, status=400)

        email = payload.get("email")
        if not email:
            return Response({"detail": "Email not found from Google."}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": f"{email.split('@')[0]}_{uuid.uuid4().hex[:6]}",
                "first_name": payload.get("given_name", ""),
                "last_name": payload.get("family_name", ""),
                "google_id": payload.get("sub"),
                "is_verified": True,
                "is_oauth_user": True,
                "is_active": True,
            },
        )

        if not created:
            user.google_id = payload.get("sub")
            user.is_verified = True
            user.is_oauth_user = True
            user.save(update_fields=["google_id", "is_verified", "is_oauth_user"])

        refresh = RefreshToken.for_user(user)

        refresh["email"] = user.email
        refresh["username"] = user.username
        refresh["role"] = user.role


        return Response({
            "message": "Google login successful.",
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "user": {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "role": user.role,
            },
        }, status=200)