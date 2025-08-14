# user/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'user'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register, name='register'),
    # CORRECTED: Use CustomTokenObtainPairView for login
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'), 
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    
    # Dashboard endpoints
    path('dashboard/', views.user_dashboard_data, name='dashboard'),
    
    # Demo credentials
    path('demo-credentials/', views.demo_credentials, name='demo_credentials'),
    
    # User management (Admin only)
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
]