"""
URL configuration for admin_panel project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from debug_toolbar.toolbar import debug_toolbar_urls

from django.conf import settings
from django.conf.urls.static import static
from .views import  ForbiddenViewPage


urlpatterns = [
    
    #Admin
    path('admin/', admin.site.urls),

    # API Version 1
    path("api/v1/auth/",include("accounts.urls")),
    path("api/v1/dashboard/",include("dashboard.api_urls")),   
    path("api/v1/",include("users.api_urls")),
    path("api/v1/profile/",include("profiles.urls_api")),
    path("api/v1/audit/",include("audit.urls")),
    path("api/v1/departments/",include("departments.urls_api")),
    path("api/v1/chat/",include("chatbot.urls_api")),
    path("api/v1/attendance/", include("attendance.urls_api")),
    path("api/v1/leave/", include("leave.urls_api")),
    path("api/v1/notifications/",include("notification.urls_api"),),


    # Web Pages
    path("", include(("accounts.web_urls", "accounts"), namespace="accounts")), 
    path("dashboard/",include(("dashboard.web_urls", "dashboard"),namespace="dashboard")),
    path("users/",include("users.web_urls")),
    path("profile/",include("profiles.urls_web"),),
    path("chat/",include("chatbot.urls_web")),
    path("departmet/",include("departments.urls_web")),
    path("attendance/", include(("attendance.urls_web", "attendance"), namespace="attendance")),
    path("leave/",include(("leave.urls_web", "leave"),namespace="leave")),
    path("common/",include("common.urls_web"),name='common'),

    path("403/",ForbiddenViewPage.as_view(),name='add_department'),


]+ debug_toolbar_urls()

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)