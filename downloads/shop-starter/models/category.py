from peewee import BooleanField, CharField, DateTimeField, Model, TextField
from datetime import datetime

from extensions import db


class Category(Model):
    class Meta:
        database = db

    name = CharField(unique=True)
    slug = CharField(unique=True)
    description = TextField(null=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)

    @classmethod
    def insert_fields(cls):
        return {
            "name": {"required": True, "type": str},
            "slug": {"required": True, "type": str},
            "description": {"required": False, "type": str},
            "is_active": {"required": False, "type": bool},
        }

    @classmethod
    def update_fields(cls):
        return {
            "name": {"required": False, "type": str},
            "slug": {"required": False, "type": str},
            "description": {"required": False, "type": str},
            "is_active": {"required": False, "type": bool},
        }

    @classmethod
    def search_fields(cls):
        return {
            "name": {"type": str, "operator": "like"},
            "slug": {"type": str, "operator": "like"},
            "is_active": {"type": bool, "operator": "eq"},
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Categories",
            "list_fields": ["id", "name", "slug", "is_active"],
            "actions": ["create", "update", "delete"],
        }
