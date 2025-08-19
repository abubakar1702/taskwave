from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.TasksAPIView.as_view(), name="tasks"),
    path('tasks/<uuid:id>/', views.TaskActionAPIView.as_view(), name="task-details"),
    path('tasks/<uuid:task_id>/subtask/<uuid:subtask_id>/', views.SubtaskAPIView.as_view(), name='subtask-detail'),
    path('task/<uuid:task_id>/subtasks/', views.SubtaskListCreateAPIView.as_view(), name="subtasks"),
    path('task/<uuid:task_id>/assignees/', views.TaskAssigneeAddAPIView.as_view(), name="add-assignee"),
    path("task/<uuid:task_id>/assignees/<uuid:user_id>/remove/", views.TaskAssigneeRemoveAPIView.as_view(), name="task-assignee-remove"),
    path('projects/', views.ProjectAPIView.as_view(), name="projects"),
    path('project/<uuid:id>/', views.ProjectActionAPIView.as_view(), name="project-action"),
    path('assets/', views.AssetCreateAPIView.as_view(), name='asset-create'),
    path('assets/list/', views.AssetListAPIView.as_view(), name='asset-create'),
    path('assets/<uuid:pk>/', views.AssetDetailAPIView.as_view(), name='asset-detail'),
    path('tasks/<uuid:task_id>/assets/', views.TaskAssetsListAPIView.as_view(), name='task-assets'),
    path('projects/<uuid:project_id>/assets/', views.ProjectAssetsListAPIView.as_view(), name='project-assets'),
]
