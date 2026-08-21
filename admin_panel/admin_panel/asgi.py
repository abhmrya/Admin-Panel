import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "channel_layers_project.settings"
)

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()   # IMPORTANT

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import channel_layers_app.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            channel_layers_app.routing.websocket_urlpatterns
        )
    ),
})




# """
# ASGI config for admin_panel project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin_panel.settings')

# application = get_asgi_application()
