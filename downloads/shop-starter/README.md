# bro-sba-py Shop Starter Models

This starter pack contains a small e-commerce data model set written in the Peewee and bro-sba-py conventions. It gives you a starting point for an online shop admin and API.

## Included models

- `Category` and `Product`: product catalog, category relationship, stock, and optional image upload.
- `User`: customer account fields and optional bro-sba-py authentication configuration.
- `Cart` and `CartItem`: a customer's active cart and its products.
- `Order` and `OrderItem`: shipping information, order status, and product/price snapshots.

The generated admin uses foreign-key selectors for related records. The order model includes `mark_paid` and `mark_shipped` custom actions that enforce simple status transitions. These actions only update the local order status; they do not contact a payment provider or shipping service.

## Use the models

1. Extract this archive into your application folder. It contains a `models/` directory.
2. Install bro-sba-py with `pipx install bro-sba-py` if you have not already.
3. From the folder containing `models/`, generate the admin and backend:

   ```console
   bro-py-admin --models-dir ./models --output-dir ./generated --auth --auth-entity user
   bro-py --models-dir ./models --output-dir ./generated --auth --auth-entity user
   ```

   The backend command asks for the database setup when needed. SQLite is convenient for trying the example locally; MySQL is also supported.
4. Install the generated project's dependencies and start it:

   ```console
   python -m pip install -r ./generated/requirements.txt
   cd generated
   python app.py
   ```

Open `http://127.0.0.1:5000/admin/` to use the generated admin.

## Before using real data

This is a learning and scaffolding example, not a complete checkout implementation. Add server-side validation and transactional business logic for cart checkout, order totals, stock reservation, refunds, and payment/shipping integrations. The sample uses `FloatField` for prices to keep the example aligned with the basic bro-sba-py model syntax; use a decimal-safe money strategy before handling real currency amounts. Review access rules and establish a trusted admin account before exposing the app.

Each model imports `db` from `extensions`, which is the default layout expected by bro-sba-py. Change those imports if your project uses another location for its database object.
