from rest_framework.routers import DefaultRouter

from .views.api import UserViewSet
from .views.userupdateadmin import UserUpdateAdminViewSet
from .views.add_user import AddUserViewSet
from .views.employee_update_hr import Employee_Update_Hr_ViewSet

router = DefaultRouter()


router.register("users",UserViewSet,basename="users")
router.register("updateuseradmin",UserUpdateAdminViewSet,basename="updateuseradmin")
router.register("add-users",AddUserViewSet,basename="add-user")
router.register("employees-list",Employee_Update_Hr_ViewSet,basename="updateemployeehr")

urlpatterns = router.urls