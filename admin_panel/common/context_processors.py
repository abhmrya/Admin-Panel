from django.conf import settings

def app_settings(request):
    print("Context Processor Called")
    print(settings.GOOGLE_CLIENT_ID)

    return {
        "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    }