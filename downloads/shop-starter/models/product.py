from datetime import datetime

from peewee import BooleanField, CharField, DateTimeField, FloatField, ForeignKeyField, IntegerField, Model, TextField

from extensions import db
from models.category import Category


class Product(Model):
    class Meta:
        database = db

    category = ForeignKeyField(Category, backref="products", on_delete="RESTRICT")
    sku = CharField(unique=True)
    name = CharField()
    description = TextField(null=True)
    price = FloatField()
    stock_quantity = IntegerField(default=0)
    image = CharField(null=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)

    @classmethod
    def insert_fields(cls):
        return {
            "category_id": {"required": True, "type": int},
            "sku": {"required": True, "type": str},
            "name": {"required": True, "type": str},
            "description": {"required": False, "type": str},
            "price": {"required": True, "type": float},
            "stock_quantity": {"required": False, "type": int},
            "image": {"required": False, "type": "image"},
            "is_active": {"required": False, "type": bool},
        }

    @classmethod
    def update_fields(cls):
        return {
            "category_id": {"required": False, "type": int},
            "sku": {"required": False, "type": str},
            "name": {"required": False, "type": str},
            "description": {"required": False, "type": str},
            "price": {"required": False, "type": float},
            "stock_quantity": {"required": False, "type": int},
            "image": {"required": False, "type": "image"},
            "is_active": {"required": False, "type": bool},
        }

    @classmethod
    def search_fields(cls):
        return {
            "sku": {"type": str, "operator": "like"},
            "name": {"type": str, "operator": "like"},
            "category_id": {"type": int, "operator": "eq"},
            "price": {"type": float, "operator": "gt"},
            "is_active": {"type": bool, "operator": "eq"},
        }

    @classmethod
    def custom_actions(cls):
        return {
            "deactivate": {
                "route": "/products/<int:id>/deactivate",
                "method": "PATCH",
                "label": "Deactivate product",
                "confirm": True,
                "generate": "full",
                "logic": {
                    "actions": [
                        {"set": {"field": "is_active", "value": False}},
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
            "menu_label": "Products",
            "list_fields": ["id", "sku", "name", "category_id", "price", "stock_quantity", "is_active"],
            "actions": ["create", "update", "delete"],
            "foreign_keys": {
                "category_id": {"model": "category", "display_field": "name"},
            },
        }
