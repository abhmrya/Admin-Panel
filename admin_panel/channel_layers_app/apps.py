from django.apps import AppConfig


class ChannelLayersAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'channel_layers_app'

    def ready(self):
        import channel_layers_app.signals
