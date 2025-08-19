from pyexpat import model
from rest_framework import serializers
from .models import Project, Role, Membership, Task, Asset, Subtask, Comment
from users.serializers import UserSerializer
from users.models import User



class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = Asset
        fields = ['id', 'file', 'task', 'project', 'uploaded_by', 'uploaded_at']

    def validate(self, data):
        task = data.get('task')
        project = data.get('project')
        if not task and not project:
            raise serializers.ValidationError("Asset must belong to either a task or a project.")
        if task and project:
            raise serializers.ValidationError("Asset cannot belong to both a task and a project.")
        return data



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
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Subtask
        fields = ['id', 'task', 'title', 'assigned_to', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'task']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.assigned_to:
            data['assigned_to'] = UserSerializer(instance.assigned_to).data
        else:
            data['assigned_to'] = None
        return data
    
    def validate(self, data):
        assigned_user = data.get('assigned_to')
        task = self.context.get('task')
        request = self.context.get('request')

        if task and assigned_user:
            if (assigned_user not in task.assignees.all() and 
                assigned_user != task.creator):
                raise serializers.ValidationError({
                    "assigned_to": "This user is not assigned to the parent task and is not the task creator."
                })

        return data

    def update(self, instance, validated_data):
        assigned_to = validated_data.get('assigned_to')
        
        if assigned_to is not None:
            if isinstance(assigned_to, list):
                if len(assigned_to) > 0:
                    try:
                        user = User.objects.get(id=assigned_to[0])
                        validated_data['assigned_to'] = user
                    except User.DoesNotExist:
                        raise serializers.ValidationError({
                            "assigned_to": "Invalid user ID provided."
                        })
                else:
                    validated_data['assigned_to'] = None
        
        return super().update(instance, validated_data)

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
    assignees = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.all()
    )
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )
    comments = CommentSerializer(many=True, read_only=True)
    assets = AssetSerializer(many=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'creator', 'subtasks', 'assignees',
            'project', 'priority', 'status', 'due_date', 'due_time',
            'comments', 'assets', 'created_at', 'updated_at'
        ]

    
    def create(self, validated_data):
        subtasks_data = validated_data.pop('subtasks', [])
        assignees_data = validated_data.pop('assignees', [])
    
        task = Task.objects.create(**validated_data)

        if assignees_data:
            task.assignees.set(assignees_data)
    
        current_user = self.context['request'].user
        assignee_ids = [user.id for user in assignees_data]
        
        for subtask_data in subtasks_data:
            assigned_user = subtask_data.get('assigned_to')
            if assigned_user:
                if assigned_user.id not in assignee_ids and assigned_user != current_user:
                    raise serializers.ValidationError({
                        "subtasks": f"User '{assigned_user.username}' must be assigned to the main task before being assigned to a subtask."
                    })
            Subtask.objects.create(task=task, **subtask_data)
    
        return task
    
    def update(self, instance, validated_data):
        subtasks_data = validated_data.pop('subtasks', None)
        assignees_data = validated_data.pop('assignees', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if assignees_data is not None:
            instance.assignees.set(assignees_data)
        
        if subtasks_data is not None:
            instance.subtasks.all().delete()
            
            current_user = self.context['request'].user
            current_assignees = list(instance.assignees.all()) if assignees_data is None else assignees_data
            assignee_ids = [user.id for user in current_assignees]
            
            for subtask_data in subtasks_data:
                assigned_user = subtask_data.get('assigned_to')
                if assigned_user:
                    if assigned_user.id not in assignee_ids and assigned_user != current_user:
                        raise serializers.ValidationError({
                            "subtasks": f"User '{assigned_user.username}' must be assigned to the main task before being assigned to a subtask."
                        })
                Subtask.objects.create(task=instance, **subtask_data)
        
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['assignees'] = UserSerializer(instance.assignees.all(), many=True).data
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['assignees'] = UserSerializer(instance.assignees.all(), many=True).data
    
        if instance.project:
            data['project'] = {
                'id': instance.project.id,
                'title': instance.project.title,
                'description': instance.project.description,
                'creator': {
                    'id': instance.project.creator.id,
                    'first_name': instance.project.creator.first_name,
                    'last_name': instance.project.creator.last_name,
                    'username': instance.project.creator.username,
                    'email': instance.project.creator.email,
                },
            }
        return data








