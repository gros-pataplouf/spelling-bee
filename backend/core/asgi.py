import os
from django.core.asgi import get_asgi_application
import django
import game.routing
# django channels
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')

django.setup()

application = ProtocolTypeRouter({
    "websocket": 
            URLRouter(
                game.routing.websocket_urlpatterns
           
    )
})