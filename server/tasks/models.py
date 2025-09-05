from django.db import models
from users.models import User
from projects.models import Project
import uuid


class Task(models.Model):
    class Priority(models.TextChoices):
        URGENT = ('urgent', 'Urgent')
        HIGH = ('high', 'High')
        MEDIUM = ('medium', 'Medium')
        LOW = ('low', 'Low')

    class Status(models.TextChoices):
        TO_DO = ('todo', 'To-Do')
        IN_PROGRESS = ('inprogress', 'In Progress')
        DONE = ('done', 'Done')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, null=True)
    assignees = models.ManyToManyField(User, blank=True, related_name="assigned_tasks")
    priority = models.CharField(max_length=10, choices=Priority.choices,
                                default=Priority.MEDIUM, verbose_name="Priority Level")
    due_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices,
                              default=Status.TO_DO, verbose_name="Task Status")
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} by {self.creator}"


class Subtask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    text = models.CharField(max_length=400)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_done = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} by {self.task.title}"
