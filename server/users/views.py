from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from api.models import Membership
from .serializers import (
    UserSerializer, 
    UserLoginSerializer, 
    UserInfoSerializer, 
    ChangePasswordSerializer,
    UsernameCheckSerializer,
    UserSearchSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.decorators import method_decorator
from social_django.utils import psa 
import pyotp
from django.core.cache import cache
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from social_core.backends.google import GoogleOAuth2
import jwt
from django.contrib.auth import get_user_model
import logging
from google.auth.transport import requests
from google.oauth2 import id_token
import random
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Q


logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            google_token = request.data.get('token')
            if not google_token:
                return Response(
                    {'error': 'Google token not provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                idinfo = id_token.verify_oauth2_token(
                    google_token, 
                    requests.Request(),
                    settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
                )

                if idinfo['aud'] != settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY:
                    raise ValueError('Wrong audience.')

                email = idinfo.get('email')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
                google_id = idinfo.get('sub')

                if not email:
                    return Response(
                        {'error': 'Email not provided by Google'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'username': email,
                        'is_active': True,
                    }
                )

                if not created:
                    user.first_name = first_name
                    user.last_name = last_name
                    user.save()

                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'username': user.username,
                    },
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': f'Welcome back, {user.first_name or user.username}!'
                }, status=status.HTTP_200_OK)

            except ValueError as e:
                logger.error(f'Google token validation error: {str(e)}')
                return Response(
                    {'error': 'Invalid Google token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f'Google token processing error: {str(e)}')
                return Response(
                    {'error': 'Failed to process Google token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f'Google authentication error: {str(e)}')
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': f'Registration successful! Your username is: {user.username}'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                if not user.is_active:
                    return Response({
                        'error': 'User account is disabled'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                refresh = RefreshToken.for_user(user)
                user_serializer = UserSerializer(user, context={'request': request})
                return Response({
                    'user': user_serializer.data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': f'Welcome back, {user.first_name or user.username}!'
                }, status=status.HTTP_200_OK)
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({
                    "error": "Refresh token is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "message": "Successfully logged out"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Invalid or expired token"
            }, status=status.HTTP_400_BAD_REQUEST)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UserInfoSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserInfoSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'user': serializer.data,
                'message': 'Profile updated successfully'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data['new_password']
            
            user.set_password(new_password)
            user.save()

            try:
                outstanding_tokens = OutstandingToken.objects.filter(user=user)
                for token in outstanding_tokens:
                    BlacklistedToken.objects.get_or_create(token=token)
            except Exception:
                pass

            return Response({
                'message': 'Password updated successfully. Please login again.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsernameCheckView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsernameCheckSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                'available': True,
                'message': 'Username is available'
            }, status=status.HTTP_200_OK)
        return Response({
            'available': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response({
                'error': 'Password is required to delete account'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(password):
            return Response({
                'error': 'Incorrect password'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            outstanding_tokens = OutstandingToken.objects.filter(user=request.user)
            for token in outstanding_tokens:
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass

        request.user.is_active = False
        request.user.save()
        
        return Response({
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)

class EmailExistsCheckView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').lower().strip()
        exists = User.objects.filter(email__iexact=email).exists()
        return Response({'exists': exists}, status=status.HTTP_200_OK)

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)
        
        totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
        otp = totp.now()
        cache.set(f'otp_{email}', otp, timeout=300)

        subject = "Your Taskwave Verification Code"
        text_content = f"Your OTP for Taskwave registration is: {otp}"
        html_content = f"""
        <html>
            <body>
                <h2>Taskwave Registration</h2>
                <p>Your verification code is: <strong>{otp}</strong></p>
                <p>This code will expire in 5 minutes.</p>
            </body>
        </html>
        """

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        return Response({"message": "OTP sent successfully"})

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        cached_otp = cache.get(f'otp_{email}')
        
        if not cached_otp or cached_otp != otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        
        cache.set(f'verified_{email}', True, timeout=3600)
        
        return Response({"message": "Email verified successfully"})



class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').lower().strip()
        new_password = request.data.get('new_password')
        otp = request.data.get('otp')

        if email and not new_password and not otp:
            try:
                validate_email(email)
            except ValidationError:
                return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

            if not User.objects.filter(email__iexact=email).exists():
                return Response({"message": "OTP sent if account exists"}, status=status.HTTP_200_OK)

            totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
            otp_code = totp.now()
            cache.set(f'otp_{email}', otp_code, timeout=300)

            print(f"Password reset OTP for {email}: {otp_code}")
            
            subject = "Your Taskwave Password Reset Code"
            text_content = f"Your password reset code is: {otp_code}"
            html_content = f"""
            <html>
                <body>
                    <h2>Taskwave Password Reset</h2>
                    <p>Your verification code is: <strong>{otp_code}</strong></p>
                    <p>This code will expire in 5 minutes.</p>
                </body>
            </html>
            """

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            return Response({"message": "OTP sent if account exists"}, status=status.HTTP_200_OK)

        if email and new_password and otp:
            cached_otp = cache.get(f'otp_{email}')

            if not cached_otp:
                return Response({"error": "OTP expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
                
            if cached_otp != str(otp).strip():
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email__iexact=email)
                user.set_password(new_password)
                user.save()

                cache.delete(f'otp_{email}')

                return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"error": "Invalid request parameters"}, status=status.HTTP_400_BAD_REQUEST)



class UserSearchAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSearchSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        if not query:
            return User.objects.none()
            
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query),
            is_active=True
        ).exclude(id=self.request.user.id).order_by('username')[:20]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

class UserSearchForAddingAsAssigneeAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSearchSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        project_id = self.request.query_params.get('project_id')

        if not query:
            return User.objects.none()

        queryset = User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query),
            is_active=True
        ).exclude(id=self.request.user.id)

        if project_id:
            if not Membership.objects.filter(user=self.request.user, project_id=project_id).exists():
                return User.objects.none()

            queryset = queryset.filter(memberships__project_id=project_id)


        return queryset.order_by('username')[:20]