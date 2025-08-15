from django.shortcuts import render
from rest_framework import generics, status, serializers
from .serializers import TaskSerializer, SubtaskSerializer, AssetSerializer, ProjectSerializer, MembershipSerializer
from .models import Task, Subtask, Asset, Project, Membership
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import models
from .filters import TaskFilter, ProjectFilter
from .validators import IsTaskCreatorOrReadOnly
from rest_framework.exceptions import NotFound



class TasksAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    filterset_class = TaskFilter

    def get_queryset(self):
        return (
            Task.objects.filter(
                models.Q(creator=self.request.user) |
                models.Q(assignees__in=[self.request.user]) |
                models.Q(project__members__in=[self.request.user])
            )
            .distinct()
            .select_related('project', 'creator')
            .prefetch_related('assignees')
        )

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project:
            if not (
                project.members.filter(id=self.request.user.id).exists() or 
                project.creator == self.request.user
            ):
                raise serializers.ValidationError({
                    "project": "You must be a project member to create tasks in this project"
                })
        serializer.save(creator=self.request.user)



class TaskActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsTaskCreatorOrReadOnly]
    serializer_class = TaskSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return Task.objects.filter(
            models.Q(creator=self.request.user) |
            models.Q(assignees__in=[self.request.user]) |
            models.Q(project__members__in=[self.request.user])
        ).distinct()

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_update(self, serializer):
        serializer.save()

    def patch(self, request, *args, **kwargs):
        try:
            return self.partial_update(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubtaskAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubtaskSerializer
    

    def get_object(self):
        task = get_object_or_404(
            Task.objects.filter(
                (
                    models.Q(creator=self.request.user) |
                    models.Q(assignees__in=[self.request.user]) |
                    models.Q(project__members__in=[self.request.user])
                ) & models.Q(id=self.kwargs['task_id'])
            ).distinct()
        )
        return get_object_or_404(Subtask, id=self.kwargs['subtask_id'], task=task)

    def get_serializer_context(self):
        return {
            'request': self.request,
            'task': self.get_object().task
        }

    def perform_update(self, serializer):
        subtask = self.get_object()
        
        if (subtask.assigned_to and 
            subtask.assigned_to != self.request.user and 
            subtask.task.creator != self.request.user):
            raise PermissionDenied("You can only update your own subtasks or if you're the task creator")
        
        serializer.save()

class SubtaskListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubtaskSerializer

    def get_task(self):
        return get_object_or_404(
            Task.objects.filter(
                (
                    models.Q(creator=self.request.user) |
                    models.Q(assignees__in=[self.request.user]) |
                    models.Q(project__members__in=[self.request.user])
                ) & models.Q(id=self.kwargs['task_id'])
            ).distinct()
        )

    def get_queryset(self):
        task = self.get_task()
        return Subtask.objects.filter(task=task).order_by("created_at")

    def perform_create(self, serializer):
        task = self.get_task()
        serializer.save(task=task)

class ProjectAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    filterset_class = ProjectFilter
    
    def get_queryset(self):
        return Project.objects.filter(
            models.Q(members__in=[self.request.user]) |
            models.Q(creator=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class ProjectActionAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        try:
            return super().get_object()
        except Project.DoesNotExist:
            raise NotFound("Project not found")


