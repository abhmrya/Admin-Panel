# from django.urls import path
# from . import consumers

# websocket_urlpatterns = [
#     # path('ws/sc', consumers.MySyncConsumer.as_asgi()),
#     # path('ws/ac', consumers.MyAsyncConsumer.as_asgi()),
#     # path('ws/index', consumers.IndexAsyncConsumer.as_asgi()),
#     path('ws/online-status/', consumers.OnlineStatusConsumer.as_asgi()),
#     path('ws/ac/<str:group_name>/', consumers.MyAsyncConsumer.as_asgi()),
#     path('ws/oc/<str:user_name>/', consumers.OneToOneAsyncConsumer.as_asgi()),

# ]
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"^ws/online-status/$", consumers.OnlineStatusConsumer.as_asgi()),
    re_path(r"^ws/ac/(?P<group_name>[^/]+)/$", consumers.MyAsyncConsumer.as_asgi()),  # ✅ fixed
    re_path(r"^ws/oc/(?P<user_name>[\w.@+-]+)/$", consumers.OneToOneAsyncConsumer.as_asgi()),
]