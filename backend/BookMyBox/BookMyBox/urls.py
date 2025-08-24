"""
URL configuration for BookMyBox project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path , include, re_path
from django.conf import settings
from django.conf.urls.static import static
from . import api_views
from . import frontend_views

# Custom error handlers
handler404 = 'BookMyBox.error_views.custom_404_view'
handler500 = 'BookMyBox.error_views.custom_500_view'
handler400 = 'BookMyBox.error_views.custom_400_view'
handler403 = 'BookMyBox.error_views.custom_403_view'


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes (must come before catch-all)
    path('api/user/', include('user.urls')),
    path('api/user_profile/', include('user_profile.urls')),
    path('api/boxes/', include('boxes.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/owner_dashboard/', include('owner_dashboard.urls')),
    path('api/dashboard/', include('user_dashboard.urls')),
    path('api/health/', api_views.health_check, name='health_check'),
    path('api/', api_views.api_info, name='api_info'),
    
    # Chatbot endpoints
    path('', include('chatbot.urls')),
    
    # Serve React app for all other routes (catch-all - MUST BE LAST)
    re_path(r'^.*$', frontend_views.serve_react_app, name='react_app'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
