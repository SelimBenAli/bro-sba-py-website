from peewee import ForeignKeyField, FloatField, IntegerField, Model

from extensions import db
from models.order import Order
from models.product import Product


class OrderItem(Model):
    class Meta:
        database = db

    order = ForeignKeyField(Order, backref="items", on_delete="CASCADE")
    product = ForeignKeyField(Product, backref="order_items", on_delete="RESTRICT")
    quantity = IntegerField(default=1)
    unit_price = FloatField()

    @classmethod
    def insert_fields(cls):
        return {
            "order_id": {"required": True, "type": int},
            "product_id": {"required": True, "type": int},
            "quantity": {"required": True, "type": int},
            "unit_price": {"required": True, "type": float},
        }

    @classmethod
    def update_fields(cls):
        return {
            "quantity": {"required": False, "type": int},
            "unit_price": {"required": False, "type": float},
        }

    @classmethod
    def search_fields(cls):
        return {
            "order_id": {"type": int, "operator": "eq"},
            "product_id": {"type": int, "operator": "eq"},
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Order items",
            "list_fields": ["id", "order_id", "product_id", "quantity", "unit_price"],
            "actions": ["create", "update", "delete"],
            "foreign_keys": {
                "order_id": {"model": "order", "display_field": "id"},
                "product_id": {"model": "product", "display_field": "name"},
            },
        }
