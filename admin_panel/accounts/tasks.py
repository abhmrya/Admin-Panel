import logging

from celery import shared_task
from accounts.models import User
from accounts.services.email import EmailService

logger = logging.getLogger(__name__)

@shared_task(
    name="accounts.send_registration_email",
)
def send_registration_email_task(
    user_id,
):
    logger.info(f"Starting email task for user={user_id} name = {(User.objects.get(id = user_id)).first_name}")
    try:
        user = User.objects.get(
            id=user_id,
        )

    except User.DoesNotExist:
        return

    EmailService.send_registration_email(
        user=user,
    )
    logger.info(f"Email sent successfully for user={user_id}")