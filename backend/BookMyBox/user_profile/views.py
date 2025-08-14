from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

# Assuming 'user_profile' is your app name and models/serializers are inside it
from user_profile.models import UserProfile
from user_profile.serializers import (
    CompleteProfileSerializer,
    ProfileUpdateSerializer,
    # UserCoreSerializer # Not used in the provided logic, so commented out
)

User = get_user_model()

class UserProfileViewSet(viewsets.ViewSet):
    """
    Viewset for current user's profile management.
    Uses ViewSet as it operates on a single object (request.user) rather than a queryset.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Helper method to get the current authenticated user."""
        return self.request.user

    @action(detail=False, methods=['get'], url_path='my-profile')
    def get_my_profile(self, request):
        """
        Get current user's complete profile.
        GET /api/user_profile/my-profile/
        """
        user = self.get_object()

        # Ensure UserProfile exists for the user. The signal should handle this,
        # but this acts as a robust fallback before serialization.
        user_profile, created = UserProfile.objects.get_or_create(user=user)

        serializer = CompleteProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], url_path='my-profile/update')
    def update_my_profile(self, request):
        """
        Update current user's profile (User and UserProfile fields).
        PATCH /api/user_profile/my-profile/update/
        """
        user = self.get_object()

        # Ensure UserProfile exists for the user.
        user_profile, created = UserProfile.objects.get_or_create(user=user)

        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            # The serializer's update method handles updating both User and UserProfile
            # Pass the user instance (which contains the user_profile via related_name if set up)
            updated_user = serializer.update(user, serializer.validated_data)

            # Return the complete updated profile
            complete_serializer = CompleteProfileSerializer(updated_user)
            return Response(complete_serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- Standard ViewSet Methods (if you map them to common routes) ---
    # These methods are relevant if you register the ViewSet with a router
    # and want the default DRF routes (e.g., /user_profile/, /user_profile/{pk}/)
    # to behave predictably for the current user.

    def list(self, request):
        """Maps default list action to get_my_profile."""
        return self.get_my_profile(request)

    def retrieve(self, request, pk=None):
        """Maps default retrieve action to get_my_profile, ensuring user match."""
        if str(pk) != str(request.user.id):
            return Response({"detail": "You can only view your own profile."},
                            status=status.HTTP_403_FORBIDDEN)
        return self.get_my_profile(request)

    def update(self, request, pk=None):
        """
        Maps default update (PUT) action to update_my_profile, ensuring user match.
        Note: If you only want PATCH for updates, you might remove this or
        have update_my_profile handle full updates differently.
        """
        if str(pk) != str(request.user.id):
            return Response({"detail": "You can only update your own profile."},
                            status=status.HTTP_403_FORBIDDEN)
        return self.update_my_profile(request) # Delegates to PATCH logic

    def partial_update(self, request, pk=None):
        """Maps default partial_update (PATCH) action to update_my_profile, ensuring user match."""
        if str(pk) != str(request.user.id):
            return Response({"detail": "You can only update your own profile."},
                            status=status.HTTP_403_FORBIDDEN)
        return self.update_my_profile(request) # Delegates to PATCH logic