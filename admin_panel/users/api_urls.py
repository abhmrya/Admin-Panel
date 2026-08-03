from rest_framework.routers import DefaultRouter

from .views.api import UserViewSet


router = DefaultRouter()


router.register(
    "users",
    UserViewSet,
    basename="users"
)


urlpatterns = router.urls