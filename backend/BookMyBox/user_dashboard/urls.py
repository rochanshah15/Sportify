# dashboard/urls.py

from django.urls import path
from .views import DashboardAnalyticsView, DashboardAchievementsView, DashboardFavoritesView

urlpatterns = [
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('achievements/', DashboardAchievementsView.as_view(), name='dashboard-achievements'),
    path('favorites/', DashboardFavoritesView.as_view(), name='dashboard-favorites'),
]