from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    LogoutView, 
    UserInfoView, 
    UpdatePasswordView,
    DeleteAccountView,
    GoogleAuthView,
    SendOTPView,
    VerifyOTPView,
    EmailExistsCheckView,
    ResetPasswordView,
    UserSearchAPIView,
    UserSearchForAddingAsAssigneeAPIView
)

app_name = 'auth'

urlpatterns = [
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserInfoView.as_view(), name='user_info'),
    path('user/password/', UpdatePasswordView.as_view(), name='update_password'),
    path('user/delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('check-email/', EmailExistsCheckView.as_view(), name='check_email'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('search/', UserSearchForAddingAsAssigneeAPIView.as_view(), name='user-search'),
]
