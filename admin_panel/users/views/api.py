from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


from accounts.models import User

from ..serializers.list import UserListSerializer
from ..serializers.detail import UserDetailSerializer
from ..serializers.update import UserUpdateSerializer
from rest_framework.permissions import IsAuthenticated


class UserViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()



    filter_backends = [

        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]


    filterset_fields = [

        "role",
        "is_active",
    ]


    search_fields = [

        "username",
        "email",
        "first_name",
        "last_name",
    ]


    ordering_fields = [

        "created_at",
        "username",

    ]


    def get_serializer_class(self):

        if self.action == "list":
            return UserListSerializer

        elif self.action == "retrieve":
            return UserDetailSerializer

        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer

        return UserListSerializer