from pyexpat import model
from rest_framework import serializers
from .models import Project, Role, Membership, Task, Asset, Subtask, Comment
from users.serializers import UserSerializer
from users.models import User



class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = Asset
        fields = ['id', 'task', 'file', 'uploaded_at', 'uploaded_by']
        read_only_fields = ['id', 'task', 'uploaded_at', 'uploaded_by']

    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("No file provided")
        return value



class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['user', 'task','created_at', 'updated_at']
    
    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True, context=self.context).data

class SubtaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    class Meta:
        model = Subtask
        fields = ['id', 'task', 'title', 'assigned_to', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'task']
    
    def validate(self, data):
        assigned_user = data.get('assigned_to')
        task = self.context.get('task')

        if task and assigned_user and assigned_user not in task.assignees.all():
            raise serializers.ValidationError({
                "assigned_to": "This user is not assigned to the parent task."
            })

        return data

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model= Role
        fields= ['name']

class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = RoleSerializer(read_only=True)
    class Meta:
        model = Membership
        fields = ['id', 'user', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    assets = AssetSerializer(many=True)
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'creator', 'members', 'tasks','assets', 'created_at', 'updated_at']
    
    def get_members(self, obj):
        memberships = obj.memberships.all()
        return MembershipSerializer(memberships, many=True).data

    def get_tasks(self, obj):
        tasks = obj.tasks.all()
        return TaskSerializer(tasks, many=True, context=self.context).data

class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    subtasks = SubtaskSerializer(many=True, required=False)
    assignees = UserSerializer(many=True)
    project = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    assets = AssetSerializer(many=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'creator', 'subtasks', 'assignees',
            'project', 'priority', 'status', 'due_date', 'due_time',
            'comments', 'assets', 'created_at', 'updated_at'
        ]
    def get_project(self, obj):
        return obj.project.title if obj.project else None


class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    class Meta:
        model = Asset
        fields = ['id', 'file', 'task', 'project', 'uploaded_by', 'uploaded_at']




