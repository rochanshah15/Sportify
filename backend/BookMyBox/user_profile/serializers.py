# profiles/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile
from datetime import date

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for profile-specific fields only (fields unique to UserProfile)"""
    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 'bio', 'preferred_sports',
            'emergency_contact', 'address'
        ]

class UserCoreSerializer(serializers.ModelSerializer):
    """Serializer for core User model fields, including phone and location."""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone', 'location', 'role', 'business_name', 'is_verified'
        ]
        read_only_fields = ['id', 'email', 'username', 'role', 'business_name', 'is_verified']

class CompleteProfileSerializer(serializers.Serializer):
    """Complete profile serializer combining User and UserProfile data for GET requests."""
    id = serializers.IntegerField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    location = serializers.CharField(source='user.location', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    business_name = serializers.CharField(source='user.business_name', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    
    # Fields from UserProfile model
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    preferred_sports = serializers.ListField(child=serializers.CharField(), required=False)
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'phone', 'location', 
            'role', 'business_name', 'is_verified', 'date_of_birth', 'bio', 
            'preferred_sports', 'emergency_contact', 'address'
        ]

class ProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating both User and UserProfile fields with cleaner logic.
    """
    # User fields that can be updated
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    location = serializers.CharField(required=False, allow_blank=True, max_length=100)

    # UserProfile fields that can be updated
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    preferred_sports = serializers.ListField(child=serializers.CharField(max_length=50), required=False)
    emergency_contact = serializers.CharField(required=False, allow_blank=True, max_length=100)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)

    # --- THIS UPDATE METHOD HAS BEEN REFACTORED AND IMPROVED ---
    def update(self, user_instance, validated_data):
        """Update both User and UserProfile models from a single payload."""
        
        # Ensure the profile exists
        profile_instance, _ = UserProfile.objects.get_or_create(user=user_instance)

        # Define which fields belong to which model for clarity
        USER_FIELDS = ['first_name', 'last_name', 'phone', 'location']
        PROFILE_FIELDS = ['date_of_birth', 'bio', 'preferred_sports', 'emergency_contact', 'address']

        # Update User and UserProfile fields dynamically
        for field in USER_FIELDS:
            if field in validated_data:
                setattr(user_instance, field, validated_data[field])
        
        for field in PROFILE_FIELDS:
            if field in validated_data:
                setattr(profile_instance, field, validated_data[field])

        # Save both instances
        user_instance.save()
        profile_instance.save()

        return user_instance # Return the main user instance