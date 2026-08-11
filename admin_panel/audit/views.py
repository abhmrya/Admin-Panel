from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .models import AuditLog
from .serializers import AuditLogSerializer

from common.permission import IsAdmin

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = (
        AuditLog.objects
        .select_related("actor")
        .order_by("-created_at")
    )

    serializer_class = AuditLogSerializer

    permission_classes = [
        IsAdmin
    ]