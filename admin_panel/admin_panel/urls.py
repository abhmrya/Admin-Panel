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


urlpatterns = [
    
    #Admin
    path('admin/', admin.site.urls),

    # API Version 1
    path("api/v1/auth/",include("accounts.urls")),
    path("api/v1/dashboard/",include("dashboard.api_urls")),   
    path("api/v1/",include("users.api_urls")),

    # Web Pages
    path("", include(("accounts.web_urls", "accounts"), namespace="accounts")), 
    path("dashboard/",include(("dashboard.web_urls", "dashboard"),namespace="dashboard")),
    path("users/",include("users.web_urls"))

]+ debug_toolbar_urls()
