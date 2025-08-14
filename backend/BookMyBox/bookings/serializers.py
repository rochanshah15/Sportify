# bookings/serializers.py

from rest_framework import serializers
from .models import Booking
# No need to import BoxSerializer if we only need specific fields from Box
# from boxes.serializers import BoxSerializer

class BookingSerializer(serializers.ModelSerializer):
    # This will display the username from your CustomUser model
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    box_name = serializers.CharField(source='box.name', read_only=True)
    box_location = serializers.CharField(source='box.location', read_only=True)
    box_sport = serializers.CharField(source='box.sport', read_only=True)
    box_image = serializers.SerializerMethodField() # For the small image on booking list

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_id', 'box', 'box_name', 'box_location', 'box_sport', 'box_image',
            'date', 'start_time', 'end_time', 'duration', 'total_amount',
            'payment_status', 'payment_id', 'booking_status', 'created_at'
        ]
        read_only_fields = ['user', 'total_amount', 'payment_status', 'payment_id', 'booking_status', 'created_at']
        # The 'box' field itself is writable, but its details are read-only via source='box.<field>'

    def get_box_image(self, obj):
        request = self.context.get('request')
        if obj.box.image and request:
            return request.build_absolute_uri(obj.box.image.url)
        # Fallback: if no single 'image', try the first in the 'images' JSONField list
        if obj.box.images and len(obj.box.images) > 0 and request:
            # Assuming images in the JSONField are relative paths or full URLs
            return request.build_absolute_uri(obj.box.images[0])
        return None