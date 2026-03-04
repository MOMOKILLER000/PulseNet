import os
from django.core.asgi import get_asgi_application

# 1. Set settings and initialize the sync application first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django_asgi_app = get_asgi_application()

# 2. Import everything else AFTER get_asgi_application()
# This prevents premature model loading/database connection hangs
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import apps.accounts.routing

application = ProtocolTypeRouter({
    # Use the pre-initialized django_asgi_app
    "http": django_asgi_app,

    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.accounts.routing.websocket_urlpatterns
        )
    ),
})