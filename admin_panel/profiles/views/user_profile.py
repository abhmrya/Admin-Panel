from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import Profile
from ..serializers.user_profile import ProfileSerializer


from rest_framework.parsers import MultiPartParser, FormParser

class ProfileView(generics.RetrieveUpdateAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def get_object(self):

            profile, created = Profile.objects.get_or_create(
                user=self.request.user
            )

            return profile