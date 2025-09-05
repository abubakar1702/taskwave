from django.contrib import admin
from .models import Task, Subtask


class SubtaskInline(admin.TabularInline):
    model = Subtask
    extra = 1
    fields = ("text", "assignee", "is_done")
    autocomplete_fields = ("assignee",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "creator",
                    "priority", "status", "created_at")
    search_fields = ("title", "creator__username")
    list_filter = ("created_at", "priority", "status")
    inlines = [SubtaskInline]


@admin.register(Subtask)
class SubTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "text", "assignee", "is_done", "created_at", "task")
    search_fields = ("text", "assignee__username", "task__title")
    list_filter = ("created_at", "is_done")
