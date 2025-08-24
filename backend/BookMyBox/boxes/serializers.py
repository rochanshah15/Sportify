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
    image = serializers.SerializerMethodField()

    class Meta:
        model = Box
        fields = [
            'id', 'name', 'sport', 'sports', 'location', 'price', 'rating',
            'capacity', 'image', 'images', 'amenities', 'description',
            'full_description', 'rules', 'latitude', 'longitude', 'reviews'
        ]

    def get_image(self, obj):
        """Handle both external URLs and local file paths properly"""
        if not obj.image:
            return None
        
        # If the image field contains a full URL (starts with http), return it directly
        image_str = str(obj.image)
        if image_str.startswith('http'):
            return image_str
        
        # Otherwise, build the URL for local files
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    def get_images(self, obj):
        request = self.context.get('request')
        all_image_urls = []
        
        # Add main image
        main_image = self.get_image(obj)
        if main_image:
            all_image_urls.append(main_image)
        
        # Add additional images from images field
        if obj.images:
            for img_path in obj.images:
                if img_path.startswith('http'):
                    all_image_urls.append(img_path)
                elif request:
                    all_image_urls.append(request.build_absolute_uri(img_path))
                else:
                    all_image_urls.append(img_path)
        
        return all_image_urls

# --- ADDED: A new serializer for owners to create/update their boxes ---
class OwnerBoxSerializer(serializers.ModelSerializer):
    """
    Serializer for owners to manage their own boxes.
    It exposes fields relevant to the owner's management tasks.
    """
    class ImagesField(serializers.ListField):
        def to_internal_value(self, data):
            # Accept both file objects and strings
            result = []
            for item in data:
                if hasattr(item, 'name'):
                    result.append(item.name)
                elif isinstance(item, str):
                    result.append(item)
                else:
                    raise serializers.ValidationError('Not a valid string or file.')
            return result

    images = ImagesField(
        child=serializers.CharField(),
        required=False
    )

    class Meta:
        model = Box
        fields = [
            'id', 'name', 'sport', 'sports', 'location', 'price', 
            'capacity', 'image', 'images', 'amenities', 'description',
            'full_description', 'rules', 'latitude', 'longitude',
            'status', 'rejection_reason'
        ]
        read_only_fields = ['status', 'rejection_reason']

    def create(self, validated_data):
        # If 'sport' is missing, set it from the first item in 'sports' (for compatibility)
        if not validated_data.get('sport') and validated_data.get('sports'):
            sports_list = validated_data['sports']
            if isinstance(sports_list, list) and len(sports_list) > 0:
                validated_data['sport'] = sports_list[0]
        images = self.context['request'].FILES.getlist('images')
        if images:
            validated_data['images'] = []
            for img in images:
                # Only store file name, not path
                if hasattr(img, 'name'):
                    validated_data['images'].append(img.name)
        else:
            # Ensure images is always a list
            if not validated_data.get('images'):
                validated_data['images'] = []
        return super().create(validated_data)