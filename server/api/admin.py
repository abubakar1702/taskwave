from django.contrib import admin
from .models import Project, Role, Membership, Task, Asset, Subtask, Comment


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "created_at", "updated_at")
    search_fields = ("title", "creator__username")
    list_filter = ("created_at",)
    inlines = [MembershipInline]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name",)
    search_fields = ("name",)


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "project", "role", "joined_at")
    search_fields = ("user__username", "project__title", "role__name")
    list_filter = ("role", "joined_at")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "priority",
                    "status", "due_date", "project")
    list_filter = ("priority", "status", "due_date", "project")
    search_fields = ("title", "creator__username", "project__title")
    filter_horizontal = ("assignees",)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("file", "uploaded_by", "uploaded_at", "task", "project")
    search_fields = ("uploaded_by__username", "task__title", "project__title")
    list_filter = ("uploaded_at",)


@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ("title", "task", "assigned_to", "is_completed")
    list_filter = ("is_completed",)
    search_fields = ("title", "task__title", "assigned_to__username")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "created_at", "parent")
    list_filter = ("created_at",)
    search_fields = ("user__username", "task__title", "text")
