from datetime import datetime

from peewee import CharField, DateTimeField, FloatField, ForeignKeyField, Model, TextField

from extensions import db
from models.user import User


class Order(Model):
    class Meta:
        database = db

    user = ForeignKeyField(User, backref="orders", on_delete="RESTRICT")
    status = CharField(default="pending")
    shipping_name = CharField()
    shipping_address = TextField()
    shipping_city = CharField()
    shipping_postal_code = CharField()
    shipping_country = CharField()
    subtotal = FloatField(default=0)
    shipping_cost = FloatField(default=0)
    total = FloatField(default=0)
    created_at = DateTimeField(default=datetime.now)

    @classmethod
    def insert_fields(cls):
        return {
            "user_id": {"required": True, "type": int},
            "shipping_name": {"required": True, "type": str},
            "shipping_address": {"required": True, "type": str},
            "shipping_city": {"required": True, "type": str},
            "shipping_postal_code": {"required": True, "type": str},
            "shipping_country": {"required": True, "type": str},
        }

    @classmethod
    def update_fields(cls):
        return {
            "shipping_name": {"required": False, "type": str},
            "shipping_address": {"required": False, "type": str},
            "shipping_city": {"required": False, "type": str},
            "shipping_postal_code": {"required": False, "type": str},
            "shipping_country": {"required": False, "type": str},
        }

    @classmethod
    def search_fields(cls):
        return {
            "user_id": {"type": int, "operator": "eq"},
            "status": {"type": str, "operator": "eq"},
        }

    @classmethod
    def custom_actions(cls):
        return {
            "mark_paid": {
                "method": "PATCH",
                "label": "Mark paid",
                "confirm": True,
                "generate": "full",
                "logic": {
                    "conditions": [
                        {"if": {"field": "status", "operator": "neq", "value": "pending"}, "then": {"error": "Only pending orders can be marked paid"}},
                    ],
                    "actions": [
                        {"set": {"field": "status", "value": "paid"}},
                        {"save": True},
                    ],
                    "return": "instance",
                },
            },
            "mark_shipped": {
                "method": "PATCH",
                "label": "Mark shipped",
                "confirm": True,
                "generate": "full",
                "logic": {
                    "conditions": [
                        {"if": {"field": "status", "operator": "neq", "value": "paid"}, "then": {"error": "Only paid orders can be shipped"}},
                    ],
                    "actions": [
                        {"set": {"field": "status", "value": "shipped"}},
                        {"save": True},
                    ],
                    "return": "instance",
                },
            },
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Orders",
            "list_fields": ["id", "user_id", "status", "total", "created_at"],
            "actions": ["create", "update", "delete"],
            "foreign_keys": {
                "user_id": {"model": "user", "display_field": "email"},
            },
        }
