from django.contrib.auth import get_user_model
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
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from users.serializers import UserSerializer



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




class TaskAssigneeAddAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_task(self):
        task_id = self.kwargs.get("task_id")
        task = get_object_or_404(
            Task.objects.filter(
                models.Q(creator=self.request.user) |
                models.Q(assignees__in=[self.request.user]) |
                models.Q(project__members__in=[self.request.user])
            ).distinct(),
            id=task_id
        )
        return task

    def get_queryset(self):
        task = self.get_task()
        return task.assignees.all()

    def list(self, request, *args, **kwargs):
        task = self.get_task()
        assignees = task.assignees.all()
        from django.contrib.auth import get_user_model
        User = get_user_model()

        return Response(UserSerializer(assignees, many=True).data)

    def create(self, request, *args, **kwargs):
        task = self.get_task()
        assignees = request.data.get("assignees")

        if not assignees or not isinstance(assignees, list):
            raise ValidationError({"assignees": "This field must be a list of user IDs."})

        from django.contrib.auth import get_user_model
        User = get_user_model()

        added_users = []
        for user_id in assignees:
            user = get_object_or_404(User, id=user_id)

            if task.creator != request.user and (
                not task.project or task.project.creator != request.user
            ):
                raise PermissionDenied("Only the task creator or project creator can add assignees.")
            
            if task.project and not task.project.members.filter(id=user.id).exists():
                raise ValidationError({
                    "assignees": f"User '{user.username}' must be a member of the project to be assigned."
                })

            task.assignees.add(user)
            added_users.append(user.username)

        task.save()

        return Response(
            {"detail": f"Added assignees: {', '.join(added_users)}"},
            status=status.HTTP_201_CREATED
        )


class TaskAssigneeRemoveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id, user_id):
        task = get_object_or_404(
            Task.objects.filter(
                models.Q(creator=request.user) |
                models.Q(assignees__in=[request.user]) |
                models.Q(project__members__in=[request.user])
            ).distinct(),
            id=task_id
        )

        User = get_user_model()
        user = get_object_or_404(User, id=user_id)

        if task.creator != request.user and (not task.project or task.project.creator != request.user):
            raise PermissionDenied("Only the task creator or project creator can remove assignees.")

        if user not in task.assignees.all():
            return Response({"detail": f"{user.username} is not an assignee of this task."}, status=400)

        task.assignees.remove(user)
        
        subtasks_updated = task.subtasks.filter(assigned_to=user).update(
            assigned_to=None,
            is_completed=False
        )
        
        response_message = f"{user.username} removed from assignees."
        if subtasks_updated > 0:
            response_message += f" {subtasks_updated} subtask(s) have been unassigned."
        
        return Response({"detail": response_message}, status=200)


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


class AssetCreateAPIView(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class AssetListAPIView(generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get("task")
        project_id = self.request.query_params.get("project")

        if task_id:
            queryset = queryset.filter(task_id=task_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class AssetDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return get_object_or_404(Asset, id=self.kwargs['pk'])

    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        if asset.file:
            asset.file.delete(save=False)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TaskAssetsListAPIView(generics.ListAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        task = get_object_or_404(Task, id=task_id)
        return Asset.objects.filter(task=task)

class ProjectAssetsListAPIView(generics.ListAPIView):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        project = get_object_or_404(Project, id=project_id)
        return Asset.objects.filter(project=project)