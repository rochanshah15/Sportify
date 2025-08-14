# boxes/serializers.py

from rest_framework import serializers
from .models import Box, Review

# --- NO CHANGES to ReviewSerializer ---
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_id', 'rating', 'comment', 'date']

# --- NO CHANGES to the existing BoxSerializer for public view ---
class BoxSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Box
        fields = [
            'id', 'name', 'sport', 'sports', 'location', 'price', 'rating',
            'capacity', 'image', 'images', 'amenities', 'description',
            'full_description', 'rules', 'latitude', 'longitude', 'reviews'
        ]

    def get_images(self, obj):
        request = self.context.get('request')
        # If request is None (e.g., in a shell), return paths without domain
        if not request:
            if obj.image:
                return [obj.image.url] + obj.images
            return obj.images

        # Build absolute URLs if request context is available
        all_image_urls = []
        if obj.image:
            all_image_urls.append(request.build_absolute_uri(obj.image.url))
        if obj.images:
            # Assuming 'images' stores full paths or needs similar building
            for img_path in obj.images:
                all_image_urls.append(request.build_absolute_uri(img_path))
        return all_image_urls

# --- ADDED: A new serializer for owners to create/update their boxes ---
class OwnerBoxSerializer(serializers.ModelSerializer):
    """
    Serializer for owners to manage their own boxes.
    It exposes fields relevant to the owner's management tasks.
    """
    class Meta:
        model = Box
        # We list all fields an owner can submit.
        # 'owner' and 'status' will be set by the server.
        fields = [
            'id', 'name', 'sport', 'sports', 'location', 'price', 
            'capacity', 'image', 'images', 'amenities', 'description',
            'full_description', 'rules', 'latitude', 'longitude',
            'status', 'rejection_reason' # Owners can see status/reason
        ]
        read_only_fields = ['status', 'rejection_reason']