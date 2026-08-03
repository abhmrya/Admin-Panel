from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


from accounts.models import User

from ..serializers.list import UserListSerializer
from ..serializers.detail import UserDetailSerializer



class UserViewSet(ModelViewSet):

    queryset = User.objects.all()

    permission_classes = [
        IsAuthenticated
    ]


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

        if self.action == "retrieve":

            return UserDetailSerializer


        return UserListSerializer