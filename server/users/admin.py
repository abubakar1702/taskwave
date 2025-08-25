from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .utils import generate_unique_username

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'username', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'is_superuser')

    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'avatar')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    search_fields = ('email', 'username')
    ordering = ('-date_joined',)

    def save_model(self, request, obj, form, change):
        if not obj.username:
            first_name = obj.first_name or 'user'
            last_name = obj.last_name or 'anon'
            obj.username = generate_unique_username(first_name, last_name)
        super().save_model(request, obj, form, change)

admin.site.register(User, UserAdmin)
