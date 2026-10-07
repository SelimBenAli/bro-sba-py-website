# bro-sba-py

**Turn Peewee models into a Flask backend and an admin dashboard.**

`bro-sba-py` generates REST API routes, service code, and browser-based admin pages from your existing Peewee models. Add authentication, live Socket.IO updates, audit history, migrations, and API documentation when your project needs them.

> bro-sba-py is under active development. Start with a demo project and review generated code and configuration before using it with real data.

## Install

Install the CLI with `pipx`:

```console
pipx install bro-sba-py
```

This installs two commands:

- `bro-py` — generate the Flask backend.
- `bro-py-admin` — generate the admin dashboard.

Run them from your application folder, where your `models/` directory lives.

## Quick start

You need Python 3.9 or newer and Peewee model files in `models/`. Generate the dashboard first, then generate the backend into the same output directory:

```console
bro-py-admin --models-dir ./models --output-dir ./generated
bro-py --models-dir ./models --output-dir ./generated
```

In an interactive terminal, the commands ask for any options you omitted. Choose SQLite for a local database file, or MySQL and enter the database name, host, port, username, and password. Your database settings are saved in `generated/.env`.

Install the generated application's dependencies and start it:

```console
python -m pip install -r ./generated/requirements.txt
cd generated
python app.py
```

Open <http://127.0.0.1:5000/admin/> to use the admin dashboard. The backend generator detects and registers the admin blueprint when it runs after the frontend generator.

### Choose features with flags

You can pass choices directly instead of answering prompts:

```console
bro-py-admin --models-dir ./models --output-dir ./generated --auth --socketio --audit-log
bro-py --models-dir ./models --output-dir ./generated --database-engine sqlite --auth --socketio --audit-log --docs --migrations --tests
```

With SQLite, the first setup asks for the database file path. For MySQL, it asks for the database name, host, port, user, and password. Optional features can also be answered interactively. Use `--non-interactive` in automation; omitted options then use documented defaults and you can edit the generated `.env` yourself.

## What it generates

- Flask app configuration, model services, and API blueprints.
- CRUD and search endpoints with pagination and sorting.
- Admin pages with search, table sorting, pagination, forms, CSV import/export, bulk updates, and bulk deletion.
- Optional admin login, signup and email verification, JWT authentication, CSRF protection, rate limiting, and role-based permissions.
- Optional live dashboard updates, notifications, operational status, and background task progress through Socket.IO.
- Optional audit history, OpenAPI/Swagger UI, pytest files, and Peewee migration commands.
- Optional generated file and image upload handling.
- Template overrides and trusted Python plugins for project-specific customization.
- Starter deployment files, including dependency lists, `.env.example`, a Dockerfile, and a WSGI entry point.

## Model configuration

The generator scans model source files with Python's AST instead of importing them. This lets it discover models without starting your app or connecting to your database.

Optional class methods configure how each model is exposed:

| Method | Purpose |
| --- | --- |
| `insert_fields()` / `update_fields()` | Define writable fields, validation, required values, and form types. |
| `search_fields()` | Choose the fields searched by the API and admin interface. |
| `sensitive_fields()` | Identify sensitive values that must be protected from regular API output. |
| `admin_config()` | Configure admin navigation, columns, actions, and role permissions. |
| `auth_config()` | Configure the model used for project authentication. |
| `custom_actions()` | Add business operations alongside the generated CRUD routes. |

## Live dashboard events

Enable `--socketio` in both commands. Generated create, update, and delete routes publish live events to connected admin dashboards. The dashboard can also show application, database, and socket connection status.

Your background tasks can publish their own progress:

```python
from extensions import publish_task_status

publish_task_status("inventory-sync", "running", "Checking stock")
# Run the task's work here.
publish_task_status("inventory-sync", "completed", "Finished")
```

Task statuses are stored in process memory, so they are temporary and are not shared across multiple workers. For multi-worker Socket.IO deployments, configure the generated app's Redis message queue and sticky sessions.

## Custom actions, templates, and plugins

Use `custom_actions()` for operations specific to your app, such as approving an order or freezing an account. Depending on the configuration, an action can create a route stub for your implementation, use supported declarative logic, or stay internal without an API route.

Pass `--templates-dir PATH` to override supported backend or admin templates. Pass `--plugin PATH` to run a trusted Python plugin that creates extra project files; the option can be repeated. Plugins execute with your user permissions, so only use code you trust.

## Command reference

```console
bro-py --help
bro-py-admin --help
```

| Option | Description |
| --- | --- |
| `--models-dir PATH` | Read models from this directory. |
| `--output-dir PATH` | Write generated files to this directory. |
| `--database-engine sqlite` or `mysql` | Select a supported database engine. |
| `--auth` | Generate authentication features. |
| `--socketio` | Generate live dashboard updates and status. |
| `--audit-log` | Generate audit history support. |
| `--docs` | Generate OpenAPI documentation and Swagger UI at `/api/docs`. |
| `--tests` | Generate pytest files; tests are not run automatically. |
| `--migrations` | Generate `manage.py` for database migrations. |
| `--sync-db` | Sync migrations after generation; requires migrations and an available database. |
| `--templates-dir PATH` | Use custom template overrides. |
| `--plugin PATH` | Load a trusted project-file generator. Can be repeated. |
| `--dry-run` | Preview changes without generating files or executing plugins. |
| `--force` | Allow existing generated files to be replaced. Review changes first. |
| `--non-interactive` | Skip terminal questions for scripts and automated workflows. |

PostgreSQL is not currently supported. SQLite and MySQL are supported.

## Regeneration and safety

Use `--dry-run` to preview changes before regenerating an existing project. Files with the generated custom-code marker preserve the protected user-written section; other manually edited generated files may be replaced when `--force` is used. Keep your actual `.env` private and review generated authentication, permissions, uploads, and database configuration before deployment.

## Links

- [Package on PyPI](https://pypi.org/project/bro-sba-py/)
- [Peewee documentation](https://docs.peewee-orm.com/)
- [Socket.IO documentation](https://flask-socketio.readthedocs.io/)

## Author and license

Maintained by **selimbenali**. Licensed under the MIT License.
"# bro-sba-py" 
