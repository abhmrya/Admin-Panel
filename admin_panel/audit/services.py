from .models import AuditLog



class AuditService:


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