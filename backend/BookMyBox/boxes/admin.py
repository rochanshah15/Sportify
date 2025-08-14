# boxes/admin.py

from django.contrib import admin
from .models import Box, Review, UserFavoriteBox

@admin.register(Box)
class BoxAdmin(admin.ModelAdmin):
    list_display = ('name', 'sport', 'location', 'price', 'rating', 'capacity')
    search_fields = ('name', 'sport', 'location', 'description')
    list_filter = ('sport', 'location', 'rating')
    ordering = ('name',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('box', 'user', 'rating', 'date')
    list_filter = ('rating', 'date')
    search_fields = ('box__name', 'user__username', 'comment') # Adjust 'user__username' if your CustomUser uses a different field for display.
    raw_id_fields = ('box', 'user') # Useful for selecting related objects when many exist
    
admin.site.register(UserFavoriteBox)
