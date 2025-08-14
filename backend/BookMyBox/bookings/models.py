# bookings/models.py

from django.db import models
from django.conf import settings # For AUTH_USER_MODEL

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    box = models.ForeignKey('boxes.Box', on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    start_time = models.CharField(max_length=5) # e.g., "09:00"
    end_time = models.CharField(max_length=5) # e.g., "10:00"
    duration = models.IntegerField(help_text="Duration in hours")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=50, default='Pending') # e.g., 'Pending', 'Completed', 'Failed'
    payment_id = models.CharField(max_length=255, blank=True, null=True) # Stripe charge ID or similar
    booking_status = models.CharField(max_length=50, default='Confirmed') # e.g., 'Confirmed', 'Cancelled'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicate bookings for the same box, date, and start time
        unique_together = ('box', 'date', 'start_time')
        ordering = ['date', 'start_time']

    def __str__(self):
        # Adjust 'username' if your CustomUser uses a different field
        return f"Booking by {self.user.username} for {self.box.name} on {self.date} at {self.start_time}"