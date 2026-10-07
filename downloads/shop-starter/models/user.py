from datetime import datetime

from peewee import BooleanField, CharField, DateTimeField, Model

from extensions import db


class User(Model):
    class Meta:
        database = db

    name = CharField()
    email = CharField(unique=True)
    password = CharField()
    role = CharField(default="customer")
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)

    @classmethod
    def insert_fields(cls):
        return {
            "name": {"required": True, "type": str},
            "email": {"required": True, "type": str},
            "password": {"required": True, "type": str},
        }

    @classmethod
    def update_fields(cls):
        return {
            "name": {"required": False, "type": str},
            "email": {"required": False, "type": str},
            "is_active": {"required": False, "type": bool},
        }

    @classmethod
    def search_fields(cls):
        return {
            "name": {"type": str, "operator": "like"},
            "email": {"type": str, "operator": "like"},
            "role": {"type": str, "operator": "eq"},
        }

    @classmethod
    def sensitive_fields(cls):
        return ["password"]

    @classmethod
    def auth_config(cls):
        return {
            "username_field": "email",
            "password_field": "password",
            "role_field": "role",
            "signup_enabled": True,
            "signup_allowed_roles": ["customer"],
            "default_role": "customer",
            "email_verification": "none",
            "admin_dashboard_roles": ["admin"],
            "default_redirect": "/dashboard",
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Customers",
            "list_fields": ["id", "name", "email", "role", "is_active"],
            "actions": ["create", "update", "delete"],
        }
