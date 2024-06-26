
from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    path('query', consumers.QueryConsumer.as_asgi()),
    re_path(r'(?P<game_uuid>[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})', consumers.GameConsumer.as_asgi()),
]

