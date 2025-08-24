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
from django.views.static import serve
from . import api_views
from . import frontend_views
import os

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
    
    # Serve React app for non-asset routes (exclude /assets/)
    re_path(r'^(?!assets/).*$', frontend_views.serve_react_app, name='react_app'),
    
]

# Add static file serving for both debug and production
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Ensure static files are served in production as well
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # For production, explicitly serve static files
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'static', 'assets')}),
    ]
