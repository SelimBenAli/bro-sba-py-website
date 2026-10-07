from peewee import ForeignKeyField, IntegerField, Model

from extensions import db
from models.cart import Cart
from models.product import Product


class CartItem(Model):
    class Meta:
        database = db

    cart = ForeignKeyField(Cart, backref="items", on_delete="CASCADE")
    product = ForeignKeyField(Product, backref="cart_items", on_delete="RESTRICT")
    quantity = IntegerField(default=1)

    @classmethod
    def insert_fields(cls):
        return {
            "cart_id": {"required": True, "type": int},
            "product_id": {"required": True, "type": int},
            "quantity": {"required": True, "type": int},
        }

    @classmethod
    def update_fields(cls):
        return {
            "quantity": {"required": False, "type": int},
        }

    @classmethod
    def search_fields(cls):
        return {
            "cart_id": {"type": int, "operator": "eq"},
            "product_id": {"type": int, "operator": "eq"},
        }

    @classmethod
    def admin_config(cls):
        return {
            "show_in_menu": True,
            "menu_label": "Cart items",
            "list_fields": ["id", "cart_id", "product_id", "quantity"],
            "actions": ["create", "update", "delete"],
            "foreign_keys": {
                "cart_id": {"model": "cart", "display_field": "id"},
                "product_id": {"model": "product", "display_field": "name"},
            },
        }
