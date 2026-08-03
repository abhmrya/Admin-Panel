from google.auth.transport import requests
from google.oauth2 import id_token

from django.conf import settings


def verify_google_token(credential: str):

    payload = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        settings.GOOGLE_CLIENT_ID,
    )

    return payload