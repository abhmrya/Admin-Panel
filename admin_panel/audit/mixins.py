from audit.services import AuditService


class AuditMixin:

    audit_action_create = None
    audit_action_update = None
    audit_action_delete = None

    def perform_create(self, serializer):


        instance = serializer.save()

        if self.audit_action_create:
            AuditService.log(
                request=self.request,
                action=self.audit_action_create,
                instance=instance,
                new_data=AuditService.serialize_instance(instance),
            )

    def perform_update(self, serializer):

        instance = serializer.instance

        old_data = AuditService.serialize_instance(instance)

        instance = serializer.save()

        new_data = AuditService.serialize_instance(instance)

        changes = AuditService.get_changes(
            old_data,
            new_data
        )

        if changes:

            AuditService.log(
                request=self.request,
                action=self.audit_action_update,
                instance=instance,
                old_data=changes,
                new_data=new_data,
            )

    def perform_destroy(self, instance):

        old_data = AuditService.serialize_instance(instance)

        if self.audit_action_delete:

            AuditService.log(
                request=self.request,
                action=self.audit_action_delete,
                instance=instance,
                old_data=old_data,
            )

        instance.delete()