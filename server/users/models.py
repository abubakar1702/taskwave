import uuid
import re
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django_otp.plugins.otp_email.models import EmailDevice


class CustomEmailDevice(EmailDevice):
    def generate_challenge(self):
        otp = self.generate_token(valid_secs=300)
        self.user.email_user(
            subject="Your Verification OTP",
            message=f"Your OTP is: {otp}",
            from_email=None,
        )
        return otp


class CustomUserManager(BaseUserManager):
    def _generate_username(self, first_name, last_name):
        first_clean = re.sub(
            r'[^a-zA-Z]', '', first_name.lower()) if first_name else ''
        last_clean = re.sub(
            r'[^a-zA-Z]', '', last_name.lower()) if last_name else ''

        base_username = f"{first_clean}{last_clean}"
        if not base_username:
            base_username = "user"

        short_uuid = str(uuid.uuid4()).replace('-', '')[:5]
        username = f"{base_username}_{short_uuid}"

        while self.model.objects.filter(username=username).exists():
            short_uuid = str(uuid.uuid4()).replace('-', '')[:5]
            username = f"{base_username}_{short_uuid}"

        return username

    def _create_user(self, email, first_name=None, last_name=None, password=None, **extra_fields):
        if not email:
            raise ValueError("You have not specified a valid email address")

        email = self.normalize_email(email)

        if not first_name and not last_name:
            email_username = email.split('@')[0]
            parts = re.split(r'[._-]', email_username)
            if len(parts) >= 2:
                first_name = parts[0]
                last_name = parts[-1]
            else:
                first_name = parts[0] if parts else 'User'
                last_name = ''

        username = self._generate_username(first_name or '', last_name or '')

        user = self.model(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, first_name=None, last_name=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, first_name, last_name, password, **extra_fields)

    def create_superuser(self, email=None, first_name=None, last_name=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, first_name, last_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True, editable=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(
        upload_to='uploads/avatars', blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.email} (@{self.username})"

    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-date_joined']
