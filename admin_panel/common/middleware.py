from django.contrib.auth import logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class JWTSessionSyncMiddleware:
    """
    If the user has a Django session but the JWT Access Token is
    missing or expired, automatically log out the session.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

    def __call__(self, request):

        # User is not logged in via session
        if not request.user.is_authenticated:
            return self.get_response(request)

        auth_header = request.headers.get("Authorization")

        # Browser page request (no Authorization header)
        if not auth_header:
            logout(request)
            return self.get_response(request)

        try:
            header = self.jwt_auth.get_header(request)
            raw_token = self.jwt_auth.get_raw_token(header)

            if raw_token is None:
                logout(request)
            else:
                self.jwt_auth.get_validated_token(raw_token)

        except (InvalidToken, TokenError):
            logout(request)

        return self.get_response(request)