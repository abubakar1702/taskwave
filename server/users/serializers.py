from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
from django.core.cache import cache


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_first_name(self, value):
        if value and len(value.strip()) < 1:
            raise serializers.ValidationError("First name must be at least 1 characters long.")
        return value.strip() if value else value

    def validate_last_name(self, value):
        if value and len(value.strip()) < 1:
            raise serializers.ValidationError("Last name must be at least 1 characters long.")
        return value.strip() if value else value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )

class UsernameCheckSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)

    def validate_username(self, value):
        value = value.lower()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_email(self, value):
        return value.lower()

class UserRegistrationSerializer(serializers.ModelSerializer):
    otp = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'otp']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        email = data.get('email')
        if not cache.get(f'verified_{email}'):
            raise serializers.ValidationError("Email not verified with OTP")
        return data
    
    def create(self, validated_data):
        validated_data.pop('otp')
        user = User.objects.create_user(**validated_data)
        return user

class UserInfoSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'avatar', 'avatar_url',
            'date_joined', 'last_login', 'is_active'
        )
        read_only_fields = (
            'id', 'email', 'date_joined', 'last_login', 'is_active'
        )

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

    def validate_first_name(self, value):
        if value is not None and len(value.strip()) < 1:
            raise serializers.ValidationError("First name must be at least 1 characters long.")
        return value.strip() if value else value

    def validate_last_name(self, value):
        if value is not None and len(value.strip()) < 1:
            raise serializers.ValidationError("Last name must be at least 1 characters long.")
        return value.strip() if value else value

    def validate_avatar(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Avatar file size cannot exceed 5MB.")
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Avatar must be a valid image file (JPEG, PNG, GIF, or WebP)."
                )
        return value

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)

        if 'avatar' in validated_data:
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = validated_data['avatar']

        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        user = self.context['request'].user
        try:
            validate_password(value, user)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({'old_password': 'Old password is incorrect.'})

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Password confirmation does not match the new password.'})

        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError({'new_password': 'New password must be different from the old password.'})

        return attrs


class UserSearchSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'full_name')
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None
    
    def get_full_name(self, obj):
        return obj.full_name
