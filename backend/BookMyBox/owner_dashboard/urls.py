# owner_dashboard/urls.py
from django.urls import path
from .views import OwnerDashboardAPIView

urlpatterns = [
    # A single endpoint to get all dashboard data at once
    path('stats/', OwnerDashboardAPIView.as_view(), name='owner-dashboard-stats'),
]