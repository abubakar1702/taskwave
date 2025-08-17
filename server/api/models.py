from django.db import models
from users.models import User
from .validators import validate_due_date, validate_file_size
import uuid

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(User, through='Membership', related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def is_member(self, user):
        return self.members.filter(id=user.id).exists()

    def __str__(self):
        return f"Project {self.title} by {self.creator}"

class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Membership(models.Model):
    class RoleChoices(models.TextChoices):
        MANAGEMENT = 'Management', 'Management'
        MEMBER = 'Member', 'Member'
        GUEST = 'Guest', 'Guest'
        INTERN = 'Intern', 'Intern'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='memberships')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} is {self.role} in {self.project.title}"


class Task(models.Model):
    class PriorityChoices(models.TextChoices):
        LOW = 'Low', 'Low'
        MEDIUM = 'Medium', 'Medium'
        HIGH = 'High', 'High'
        URGENT = 'Urgent', 'Urgent'
    
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        IN_PROGRESS = 'In Progress', 'In Progress'
        COMPLETED = 'Completed', 'Completed'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks_created')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignees = models.ManyToManyField(
        User, blank=True, related_name='assigned_tasks')
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    priority = models.CharField(
        max_length=10, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    due_date = models.DateField(null=True, blank=True, validators=[validate_due_date])
    due_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-due_date', 'priority']
        indexes = [
            models.Index(fields=['due_date']),
            models.Index(fields=['priority']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        if self.project:
            return f"{self.title} (Project: {self.project.title})"
        return f"{self.title} (Independent)"

class Asset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='assets/', validators=[validate_file_size])
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='assets')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='assets')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_assets')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)


class Subtask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='subtasks_assigned')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subtask {self.title} for {self.task.title}"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"