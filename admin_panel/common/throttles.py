# from rest_framework.throttling import UserRateThrottle
from rest_framework.throttling import AnonRateThrottle

from rest_framework.throttling import SimpleRateThrottle
from rest_framework.exceptions import Throttled

class LoginThrottle(SimpleRateThrottle):
    scope = "login"

    def get_cache_key(self, request, view):
        email = request.data.get("email")
        if not email:
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": email.lower(),
        }

    def throttle_failure(self):
        wait = self.wait()
        wait = int(wait/60)

        raise Throttled(
            detail=f"Too many login attempts of Admin Panel. Please try again after {wait} minutes."
        )
    

class RegisterThrottle(AnonRateThrottle):
    scope = "register"