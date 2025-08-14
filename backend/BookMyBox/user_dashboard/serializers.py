# dashboard/serializers.py
from rest_framework import serializers
from .models import Achievement
from boxes.models import Box, UserFavoriteBox

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description']



class BoxForFavoriteSerializer(serializers.ModelSerializer):
    price_per_hour = serializers.SerializerMethodField()
    class Meta:
        model = Box
        fields = ['id', 'name', 'location', 'price_per_hour', 'description']

    def get_price_per_hour(self, obj):
        return getattr(obj, 'price', None)


class FavoriteBoxSerializer(serializers.ModelSerializer):
    box = BoxForFavoriteSerializer(read_only=True)
    box_id = serializers.PrimaryKeyRelatedField(queryset=Box.objects.all(), source='box', write_only=True, required=False)
    added_on = serializers.DateTimeField(source="added_at", format="%Y-%m-%d", read_only=True)

    class Meta:
        model = UserFavoriteBox
        fields = ['id', 'box', 'box_id', 'added_on']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        box_representation = representation.pop('box', None)
        if box_representation:
            for key in box_representation:
                representation[key] = box_representation[key]
        representation.pop('box_id', None)
        return representation