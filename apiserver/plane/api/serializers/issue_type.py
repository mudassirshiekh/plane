# Module imports
from plane.ee.serializers import BaseSerializer
from plane.db.models import IssueType, ProjectIssueType


class IssueTypeAPISerializer(BaseSerializer):
    class Meta:
        model = IssueType
        fields = fields = "__all__"
        read_only_fields = [
            "workspace",
            "logo_props",
            "is_default",
            "level",
            "deleted_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]


class ProjectIssueTypeAPISerializer(BaseSerializer):
    class Meta:
        model = ProjectIssueType
        fields = fields = "__all__"
        read_only_fields = [
            "workspace",
            "project",
            "level",
            "is_default",
            "deleted_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
