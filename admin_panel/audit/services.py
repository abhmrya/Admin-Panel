import json
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from .models import AuditLog
from .config import AUDIT_FIELDS


class AuditService:

    # @staticmethod
    # def serialize_instance(instance):

    #     data = model_to_dict(instance)

    #     return json.loads(
    #         json.dumps(
    #             data,
    #             cls=DjangoJSONEncoder
    #         )
    #     )

    @staticmethod
    def serialize_instance(instance):

        fields = AUDIT_FIELDS.get( 
            instance.__class__,   # ye table ke sare fields nikal ke de raha 
            []
        )

        data = {}

        for field_name in fields:

            value = getattr(
                instance,
                field_name,
                None
            )

            data[field_name] = value

        return json.loads(
            json.dumps(
                data,
                cls=DjangoJSONEncoder
            )
        )

    @staticmethod
    def get_changes(old_data, new_data):

        changes = {}

        for key in new_data:

            if old_data.get(key) != new_data.get(key):

                changes[key] = {
                    "old": old_data.get(key),
                    "new": new_data.get(key)
                }

        return changes


    @staticmethod
    def get_client_ip(request):

        x_forwarded_for = request.META.get(
            "HTTP_X_FORWARDED_FOR"
        )


        if x_forwarded_for:

            return x_forwarded_for.split(",")[0]


        return request.META.get(
            "REMOTE_ADDR"
        )



    @staticmethod
    def log(
        request,
        action,
        instance,
        old_data=None,
        new_data=None,
    ):

        AuditLog.objects.create(

            actor=(
                request.user
                if request.user.is_authenticated
                else None
            ),


            action=action,


            resource=(
                instance.__class__.__name__
            ),


            object_id=str(
                instance.pk
            ),


            old_values=old_data,


            new_values=new_data,


            ip_address=
            AuditService.get_client_ip(
                request
            ),


            user_agent=
            request.META.get(
                "HTTP_USER_AGENT"
            ),


            request_method=
            request.method,


            endpoint=
            request.path,

        )