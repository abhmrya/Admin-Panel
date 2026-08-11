from rest_framework.routers import DefaultRouter

from .views.api import UserViewSet
from .views.userupdateadmin import UserUpdateAdminViewSet
from .views.add_user import AddUserViewSet


router = DefaultRouter()


router.register("users",UserViewSet,basename="users")
router.register("updateuseradmin",UserUpdateAdminViewSet,basename="updateuseradmin")
router.register("add-users",AddUserViewSet,basename="add-user")

urlpatterns = router.urls