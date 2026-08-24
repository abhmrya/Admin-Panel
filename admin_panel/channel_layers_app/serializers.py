# yourapp/serializers.py
from rest_framework import serializers
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# users/tokens.py
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed
def get_tokens_for_user(user):
    if not user.is_active:
        raise AuthenticationFailed("User is not active")
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'],
            email = validated_data.get('email'),
            password = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            last_name = validated_data.get('last_name', '')
        )
        print(user)
        return user 


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    recaptcha_token = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        print("Validating login:", data)
        user = authenticate(username=data['username'], password=data['password'])
        print("Auth result:", user)

        if user is not None:
            print(get_tokens_for_user(user))
            return {
                "user": user,
                "tokens": get_tokens_for_user(user)
            }

        if user is None:
            raise AuthenticationFailed("Invalid username or password")
