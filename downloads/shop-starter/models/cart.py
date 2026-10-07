from datetime import datetime

from peewee import CharField, DateTimeField, ForeignKeyField, Model

from extensions import db
from models.user import User


class Cart(Model):
    class Meta:
        database = db

    user = ForeignKeyField(User, backref="carts", on_delete="CASCADE")
    status = CharField(default="active")
    created_at = DateTimeField(default=datetime.now)

    @classmethod
    def insert_fields(cls):
        return {
            "user_id": {"required": True, "type": int},
        }

    @classmethod
    def update_fields(cls):
        return {
            "status": {"required": False, "type": str, "choices": ["active", "checked_out", "abandoned"]},
        }

    @classmethod
    def search_fields(cls):
        return {
            "user_id": {"type": int, "operator": "eq"},
            "status": {"type": str, "operator": "eq"},
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Carts",
            "list_fields": ["id", "user_id", "status", "created_at"],
            "actions": ["create", "update", "delete"],
            "foreign_keys": {
                "user_id": {"model": "user", "display_field": "email"},
            },
        }
