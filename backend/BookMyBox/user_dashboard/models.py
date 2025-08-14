from django.db import models
from django.conf import settings

class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True) # e.g., 'Trophy', 'Star' for icon name

    def __str__(self):
        return self.name

# Link achievements to user profile via ManyToManyField
from user_profile.models import UserProfile
UserProfile.add_to_class('achievements', models.ManyToManyField(Achievement, blank=True))