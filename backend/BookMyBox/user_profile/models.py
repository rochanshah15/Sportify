# profiles/models.py (RECOMMENDED - NO PHONE/LOCATION)
from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    """Extended user profile model for additional fields"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='profile'
    )
    # REMOVED: phone = models.CharField(max_length=20, blank=True, null=True)
    # REMOVED: location = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    preferred_sports = models.JSONField(default=list, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Access email from the related User object
        return f"{self.user.email}'s Profile"

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'