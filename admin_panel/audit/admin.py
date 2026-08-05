from django.contrib import admin

from .models import AuditLog



@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):


    list_display = (
        "action",
        "actor",
        "resource",
        "object_id",
        "created_at",
    )


    search_fields = (
        "action",
        "actor__email",
        "resource",
    )


    readonly_fields = (
        "id",
        "created_at",
    )