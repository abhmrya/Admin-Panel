from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^ws/online-status/$", consumers.OnlineStatusConsumer.as_asgi()),
    re_path(r"^ws/ac/(?P<group_name>[^/]+)/$", consumers.MyAsyncConsumer.as_asgi()),
    re_path(r"^ws/oc/(?P<user_name>[\w.@+-]+)/$", consumers.OneToOneAsyncConsumer.as_asgi()),
]