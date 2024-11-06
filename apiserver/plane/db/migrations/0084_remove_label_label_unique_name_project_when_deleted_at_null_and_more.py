# Generated by Django 4.2.15 on 2024-11-05 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0083_device_workspace_timezone_and_more"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="label",
            name="label_unique_name_project_when_deleted_at_null",
        ),
        migrations.AlterUniqueTogether(
            name="label",
            unique_together=set(),
        ),
        migrations.AddField(
            model_name="deployboard",
            name="is_disabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="inboxissue",
            name="extra",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="inboxissue",
            name="source_email",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="bot_type",
            field=models.CharField(
                blank=True, max_length=30, null=True, verbose_name="Bot Type"
            ),
        ),
        migrations.AlterField(
            model_name="deployboard",
            name="entity_name",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name="inboxissue",
            name="source",
            field=models.CharField(
                blank=True, default="IN_APP", max_length=255, null=True
            ),
        ),
        migrations.AddConstraint(
            model_name="label",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    ("deleted_at__isnull", True), ("project__isnull", True)
                ),
                fields=("name",),
                name="unique_name_when_project_null_and_not_deleted",
            ),
        ),
        migrations.AddConstraint(
            model_name="label",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    ("deleted_at__isnull", True), ("project__isnull", False)
                ),
                fields=("project", "name"),
                name="unique_project_name_when_not_deleted",
            ),
        ),
    ]
