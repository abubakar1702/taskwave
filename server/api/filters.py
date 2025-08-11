import django_filters
from .models import Task, Project
from django.utils.timezone import now


class TaskFilter(django_filters.FilterSet):
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='iexact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    creator = django_filters.UUIDFilter(field_name='creator')

    assigned_to_me = django_filters.BooleanFilter(method='filter_assigned_to_me')
    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')
    due_today = django_filters.BooleanFilter(method='filter_due_today')
    overdue = django_filters.BooleanFilter(method='filter_overdue')

    class Meta:
        model = Task
        fields = ['priority', 'status', 'creator']

    def filter_assigned_to_me(self, queryset, name, value):
        if value and self.request.user.is_authenticated:
            return queryset.filter(assignees=self.request.user)
        return queryset

    def filter_created_by_me(self, queryset, name, value):
        if str(value).lower() == 'true' and self.request.user.is_authenticated:
            filtered = queryset.filter(creator=self.request.user)
            return filtered
        elif str(value).lower() == 'false':
            filtered = queryset.exclude(creator=self.request.user)
            return filtered
        return queryset

    def filter_due_today(self, queryset, name, value):
        if value:
            today = now().date()
            return queryset.filter(due_date=today)
        return queryset

    def filter_overdue(self, queryset, name, value):
        if value:
            today = now().date()
            return queryset.filter(due_date__lt=today).exclude(status__iexact="Completed")
        return queryset

class ProjectFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='iexact')

    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')

    class Meta:
        model = Project
        fields = ['status', 'priority']

    def filter_created_by_me(self, queryset, name, value):
        if str(value).lower() == 'true' and self.request.user.is_authenticated:
            return queryset.filter(creator=self.request.user)
        elif str(value).lower() == 'false':
            return queryset.exclude(creator=self.request.user)
        return queryset