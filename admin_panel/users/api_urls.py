from rest_framework.routers import DefaultRouter

from .views.api import UserViewSet
from .views.userupdateadmin import UserUpdateAdminViewSet

router = DefaultRouter()


router.register(
    "users",
    UserViewSet,
    basename="users"
)

router.register("updateuseradmin",UserUpdateAdminViewSet,basename="updateuseradmin")


urlpatterns = router.urls