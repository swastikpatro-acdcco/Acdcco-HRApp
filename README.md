# ACDC HR Application

A Django-based HR management application using PostgreSQL for managing employee information.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Testing](#api-testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 16+ (with psql and pgAdmin)
- pip (Python package manager)
- virtualenv (recommended)


## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Acdcco-HRApp
```

### 2. Create and Activate Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Required packages include:
- Django 5.2.5
- psycopg2-binary (PostgreSQL adapter)
- djangorestframework
- django-cors-headers

## Database Setup

### Option A: Using Existing PostgreSQL Schema (Recommended if you have the schema file)

#### 1. Verify PostgreSQL Installation

**macOS:**
```bash
# Check PostgreSQL version
psql --version

# If command not found, find the installation path
which psql
# Or try the full path
/Library/PostgreSQL/16/bin/psql --version
```

**Windows:**
```cmd
# Check if PostgreSQL is running
sc query postgresql-x64-16

# Try psql
psql --version

# If not in PATH, use full path
"C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
```

#### 2. Create PostgreSQL Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres -h localhost

# In psql prompt, create the database
CREATE DATABASE acdc_hrapp;

# Exit psql
\q
```

#### 3. Run the Schema File

```bash
# Apply the PostgreSQL schema
psql -U postgres -h localhost -d acdc_hrapp -f ADAC_prople.sql
```

This creates:
- `people` table with proper structure
- Custom ENUM type (`member_status`)
- CITEXT extension for case-insensitive emails
- Indexes and triggers
- `active_people_v` view

#### 4. Configure Django Database Settings

Edit `company_portal/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'acdc_hrapp',
        'USER': 'postgres',          # Your PostgreSQL username
        'PASSWORD': 'your_password',  # Your PostgreSQL password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**To find your PostgreSQL port:**
```bash
psql -U postgres -h localhost
# In psql:
SHOW port;
\q
```

#### 5. Verify Django Can Connect to PostgreSQL

```bash
# Test database connection
python manage.py dbshell
```

If successful, you'll see the psql prompt:
```
psql (16.4)
Type "help" for help.

acdc_hrapp=#
```

Type `\dt` to see tables, then `\q` to exit.

#### 6. Handle Django Migrations (Critical Step!)

Since you already have the `people` table in PostgreSQL, you need to sync Django's migration system without trying to recreate the table:

```bash
# Create an empty initial migration for the people app
python manage.py makemigrations people --empty --name initial

# This creates: people/migrations/0001_initial.py
# The file should have empty operations since the table already exists
```

Edit the generated migration file (`people/migrations/0001_initial.py`) to ensure it has:
```python
from django.db import migrations

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    
    operations = [
        # Empty - table already exists in PostgreSQL
    ]
```

**Apply migrations (fake mode for existing tables):**
```bash
# Fake the people app migration since table exists
python manage.py migrate --fake

# Apply Django system migrations (auth, sessions, admin, etc.)
python manage.py migrate
```

**Verify all tables exist:**
```bash
python manage.py dbshell
\dt
# You should see: people, django_session, auth_user, etc.
\q
```

### Option B: Starting Fresh (No existing schema)

If you don't have the schema file or want Django to create everything:

```bash
# Create empty database
createdb acdc_hrapp

# Configure settings.py with database credentials

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

Note: This won't create the PostgreSQL-specific features (CITEXT, custom ENUMs, triggers) from the original schema.

## Running the Application

### 1. Create Superuser Account

```bash
python manage.py createsuperuser
```

You'll be prompted for:
- Username
- Email address
- Password

### 2. Start the Development Server

```bash
python manage.py runserver
```

The server will start at: `http://127.0.0.1:8000/`

### 3. Access the Admin Panel

Navigate to: `http://127.0.0.1:8000/admin/`

Login with your superuser credentials.

You should see:
- **People** section with **Persons** management
- Ability to add, edit, and view employee records

### 4. Test the Database Connection

Open Django shell:
```bash
python manage.py shell
```

Run test commands:
```python
from people.models import Person

# Check existing records
print(Person.objects.count())

# Create a test person
person = Person(
    full_name="John Doe",
    department="Engineering",
    start_date="2024-01-01",
    status="active"
)
person.save()
print(f"Created: {person}")

# Query all people
people = Person.objects.all()
for p in people:
    print(f"{p.full_name} - {p.department}")

exit()
```

## API Testing

The application provides REST API endpoints for managing employee data.

### Prerequisites
- Ensure the development server is running:
```bash
  python manage.py runserver
```
## Available Endpoints

### 1. List All Employees

```bash
GET http://127.0.0.1:8000/api/employees/
```

### 2. Filter Employees

Filter by department:
```bash
GET http://127.0.0.1:8000/api/employees/filter_employees/?department=Engineering
```

Filter by status:
```bash
GET http://127.0.0.1:8000/api/employees/filter_employees/?status=active
```

Filter by both:
```bash
GET http://127.0.0.1:8000/api/employees/filter_employees/?department=Engineering&status=active
```

### 3. Delete Employee

Delete by email (recommended):
```bash
DELETE http://127.0.0.1:8000/api/employees/delete_by_identifier/?email=john.doe@acdcco.org
```

Delete by full name:
```bash
DELETE http://127.0.0.1:8000/api/employees/delete_by_identifier/?full_name=John Doe
```

## Troubleshooting

### Issue: "relation 'django_session' does not exist"

**Solution:**
```bash
# Reset sessions migration
python manage.py migrate sessions zero --fake
python manage.py migrate sessions

# Or force table creation
python manage.py migrate sessions --run-syncdb
```

### Issue: "psql: command not found"

**Solution (macOS):**
```bash
# Find PostgreSQL installation
which postgres

# Add to PATH in ~/.zshrc or ~/.bashrc
export PATH="/Library/PostgreSQL/16/bin:$PATH"

# Reload shell
source ~/.zshrc
```

**Solution (Windows):**
Add `C:\Program Files\PostgreSQL\16\bin` to your system PATH environment variable.

### Issue: Migration conflicts or "table already exists"

**Solution:**
```bash
# Remove problematic migration files
rm people/migrations/000*.py
# Keep __init__.py

# Create fresh empty migration
python manage.py makemigrations people --empty --name initial

# Fake apply it
python manage.py migrate --fake-initial
```

### Issue: Can't login to admin panel

**Solution:**
```bash
# Check existing users
python manage.py shell
from django.contrib.auth.models import User
for user in User.objects.all():
    print(f"{user.username} - superuser: {user.is_superuser}")
exit()

# Reset password for existing user
python manage.py changepassword your_username

# Or create new superuser
python manage.py createsuperuser
```

### Issue: Port 8000 already in use

**Solution (macOS/Linux):**
```bash
# Kill all processes on port 8000
sudo lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8080
```

### Issue: Database connection errors

**Solution:**
```bash
# Test PostgreSQL is running
psql -U postgres -h localhost

# Check your settings.py credentials
# Verify: NAME, USER, PASSWORD, HOST, PORT

# Test connection from Django
python manage.py dbshell
```


---

**Last Updated:** September 2025
**Django Version:** 5.2.6
**PostgreSQL Version:** 16+