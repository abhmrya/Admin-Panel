from django.contrib import admin
from . models import Group_name, Chat_msg, OneToOneMessage, UserProfile
# Register your models here.

@admin.register(Group_name)
class groupAdmin(admin.ModelAdmin):
    list_display = ['id','groupname']


@admin.register(Chat_msg)
class chatAdmin(admin.ModelAdmin):
    list_display = ['id','user', 'group','message','time','audio']


@admin.register(OneToOneMessage)
class onetooneAdmin(admin.ModelAdmin):
    list_display = ['id','send_from', 'send_to','message','time']

@admin.register(UserProfile)
class userprofileAdmin(admin.ModelAdmin):
    list_display = ['id','user', 'online', 'profile_image']
