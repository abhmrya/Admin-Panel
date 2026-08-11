from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet

from accounts.models import User

from ..serializers.add_users import (AddUserSerializer)

from common.permission import IsAdminOrHR


class AddUserViewSet(CreateModelMixin,GenericViewSet):

    permission_classes = [IsAdminOrHR]

    queryset = User.objects.all()

    serializer_class = AddUserSerializer