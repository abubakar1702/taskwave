from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.TasksAPIView.as_view(), name="tasks"),
    path('tasks/<uuid:id>/', views.TaskActionAPIView.as_view(), name="task_details"),
    path('tasks/<uuid:task_id>/subtask/<str:subtask_id>/', views.SubtaskAPIView.as_view(), name='subtask-detail'),
    #path('tasks/filter/', views.TaskFilterAPIView.as_view(), name='task-filter'),
    path('projects/', views.ProjectAPIView.as_view(), name="projects"),
    path('project/<uuid:id>/', views.ProjectActionAPIView.as_view(), name="project_action"),
]
