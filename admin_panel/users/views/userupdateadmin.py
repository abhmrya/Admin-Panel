from rest_framework import viewsets

from accounts.models import User

from ..serializers.userupdateadmin import UserUpdateAdminSerializer

from common.permission import IsAdmin

from audit.services import AuditService
from audit.constants import AuditAction
from audit.mixins import AuditMixin


class UserUpdateAdminViewSet(AuditMixin,viewsets.ModelViewSet):

    queryset = User.objects.all().order_by("-created_at")

    serializer_class = UserUpdateAdminSerializer

    permission_classes = [
        IsAdmin
    ]

    audit_action_create = AuditAction.USER_CREATED

    audit_action_update = AuditAction.USER_UPDATED

    audit_action_delete = AuditAction.USER_DELETED


    def get_user_data(self, user):

        return {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        }



    # def update(self, request, *args, **kwargs):

    #     user = self.get_object()


    #     # Old data before update

    #     # old_data = self.get_user_data(user)



    #     # DRF update

    #     response = super().update(
    #         request,
    #         *args,
    #         **kwargs
    #     )



    #     # latest database value

    #     # user.refresh_from_db()



    #     # New data after update

    #     # new_data = self.get_user_data(user)



    #     # Audit only if something changed

    #     # if old_data != new_data:

    #     #     AuditService.log(

    #     #         request=request,

    #     #         action=AuditAction.USER_UPDATED,

    #     #         instance=user,

    #     #         old_data=old_data,

    #     #         new_data=new_data

    #     #     )


    #     return response