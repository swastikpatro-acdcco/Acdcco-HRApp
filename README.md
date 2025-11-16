# ACDC HR Application

A Django-based HR management application using PostgreSQL for managing employee information with JWT authentication.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Authentication & User Management](#authentication--user-management)
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
- djangorestframework-simplejwt (JWT authentication)
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
# You should see: people, django_session, auth_user, token_blacklist_*, etc.
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

## Authentication & User Management

The application uses JWT (JSON Web Token) authentication for secure API access.

### Prerequisites
- Ensure the development server is running:
```bash
python manage.py runserver
```

### 1. User Registration

Register a new user account:

**Endpoint:** `POST /api/register/`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@acdcco.org",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@acdcco.org",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 3,
    "username": "john_doe",
    "email": "john@acdcco.org",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "User registered successfully! You can now login."
}
```

**Validation:**
- Username must be unique (3+ characters, no spaces)
- Email must be unique and valid
- Password must be strong (8+ characters, not common)
- password and password2 must match

### 2. User Login (Get JWT Tokens)

Login to receive access and refresh tokens:

**Endpoint:** `POST /api/token/`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczMTk0ODIzOCwiaWF0IjoxNzMxMzQzNDM4LCJqdGkiOiJhYmMxMjM0NTY3ODkiLCJ1c2VyX2lkIjozfQ.xyz...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxMzQ3MDM4LCJpYXQiOjE3MzEzNDM0MzgsImp0aSI6ImRlZjk4NzY1NDMyMSIsInVzZXJfaWQiOjN9.abc..."
}
```

**Token Lifetimes:**
- **Access Token:** Valid for 60 minutes (use for API requests)
- **Refresh Token:** Valid for 7 days (use to get new access tokens)

**Store these tokens securely!** You'll need them for authenticated requests.

### 3. Using Access Tokens (Protected Endpoints)

Include the access token in the Authorization header for protected endpoints:

**Example - Get User Profile:**

**Endpoint:** `GET /api/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**cURL Example:**
```bash
curl http://127.0.0.1:8000/api/profile/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "id": 3,
  "username": "john_doe",
  "email": "john@acdcco.org",
  "first_name": "John",
  "last_name": "Doe",
  "is_staff": false,
  "is_active": true,
  "date_joined": "2024-11-11T14:30:38.123456Z",
  "last_login": "2024-11-11T15:00:00.000000Z"
}
```

**Without Token (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 4. Refresh Access Token

When your access token expires (after 60 minutes), use the refresh token to get a new access token:

**Endpoint:** `POST /api/token/refresh/`

**Request Body:**
```json
{
  "refresh": "YOUR_REFRESH_TOKEN_HERE"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_ACCESS_TOKEN..."
}
```

**Note:** With `ROTATE_REFRESH_TOKENS: True`, you may also receive a new refresh token.

### 5. Logout (Blacklist Token)

Invalidate your refresh token to log out:

**Endpoint:** `POST /api/token/blacklist/`

**Request Body:**
```json
{
  "refresh": "YOUR_REFRESH_TOKEN_HERE"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/token/blacklist/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**
```json
{
  "detail": "Token is blacklisted"
}
```

After blacklisting, the refresh token cannot be used again. The user must log in to get new tokens.

### 6. Change Password

Change password for authenticated user:

**Endpoint:** `POST /api/change-password/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Request Body:**
```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!",
  "new_password2": "NewSecurePass456!"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/change-password/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePass123!",
    "new_password": "NewSecurePass456!",
    "new_password2": "NewSecurePass456!"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

### 7. List All Users (Authenticated)

Get a list of all registered users:

**Endpoint:** `GET /api/users/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**cURL Example:**
```bash
curl http://127.0.0.1:8000/api/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@acdcco.org",
    "first_name": "Admin",
    "last_name": "User",
    "is_staff": true,
    "is_active": true,
    "date_joined": "2024-11-01T10:00:00Z"
  },
  {
    "id": 3,
    "username": "john_doe",
    "email": "john@acdcco.org",
    "first_name": "John",
    "last_name": "Doe",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2024-11-11T14:30:38Z"
  }
]
```

### Authentication Testing with Postman

#### Setup:

1. **Create a Collection:** "ACDC HR API"
2. **Set Collection Variables:**
   - `base_url`: `http://127.0.0.1:8000`
   - `access_token`: (leave empty, will be set automatically)
   - `refresh_token`: (leave empty, will be set automatically)

#### Test 1: Register User

- **Method:** POST
- **URL:** `{{base_url}}/api/register/`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "username": "test_user",
  "email": "test@acdcco.org",
  "password": "TestPass123!",
  "password2": "TestPass123!",
  "first_name": "Test",
  "last_name": "User"
}
```

#### Test 2: Login

- **Method:** POST
- **URL:** `{{base_url}}/api/token/`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "username": "test_user",
  "password": "TestPass123!"
}
```
- **Tests Tab (Auto-save tokens):**
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("access_token", jsonData.access);
pm.collectionVariables.set("refresh_token", jsonData.refresh);
```

#### Test 3: Get Profile

- **Method:** GET
- **URL:** `{{base_url}}/api/profile/`
- **Authorization:** Bearer Token → `{{access_token}}`

#### Test 4: Refresh Token

- **Method:** POST
- **URL:** `{{base_url}}/api/token/refresh/`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "refresh": "{{refresh_token}}"
}
```

#### Test 5: Logout

- **Method:** POST
- **URL:** `{{base_url}}/api/token/blacklist/`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "refresh": "{{refresh_token}}"
}
```

### Complete Authentication Flow

```
1. User Registration
   POST /api/register/ → User created in auth_user table

2. User Login
   POST /api/token/ → Returns access + refresh tokens

3. Access Protected API
   GET /api/profile/ (with Authorization header) → Returns user data

4. Access Token Expires (after 60 min)
   GET /api/profile/ → 401 Unauthorized "Token expired"

5. Refresh Token
   POST /api/token/refresh/ → Returns new access token

6. Continue Using API
   GET /api/profile/ (with new token) → Works again

7. User Logout
   POST /api/token/blacklist/ → Refresh token invalidated
   
8. Must Login Again
   POST /api/token/ → Get new tokens
```

## API Testing

The application provides REST API endpoints for managing employee data.

### Prerequisites
- Ensure the development server is running:
```bash
python manage.py runserver
```

**Note:** Employee endpoints will require JWT authentication if `IsAuthenticated` permission is enabled.

## Available Endpoints

### 1. List All Employees

```bash
GET http://127.0.0.1:8000/api/employees/
```

**With Authentication:**
```bash
curl http://127.0.0.1:8000/api/employees/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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

**With Authentication:**
```bash
curl "http://127.0.0.1:8000/api/employees/filter_employees/?department=Engineering" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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

**With Authentication:**
```bash
curl -X DELETE "http://127.0.0.1:8000/api/employees/delete_by_identifier/?email=john.doe@acdcco.org" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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

### Issue: "No active account found with the given credentials"

**Solution:**
```bash
# Verify user exists
python manage.py shell
from django.contrib.auth.models import User
User.objects.filter(username='your_username').exists()
exit()

# If user doesn't exist, register via /api/register/
# If user exists, verify password is correct
```

### Issue: "Authentication credentials were not provided"

**Solution:**
- Make sure you include the Authorization header
- Format: `Authorization: Bearer YOUR_ACCESS_TOKEN`
- Don't forget the word "Bearer" and space before token
- Verify token hasn't expired (access tokens expire after 60 minutes)

### Issue: "Given token not valid for any token type"

**Solution:**
```bash
# Token is expired or invalid
# Get new tokens by logging in again:
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# Or refresh with refresh token:
curl -X POST http://127.0.0.1:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```


---

**Last Updated:** November 2024
**Django Version:** 5.2.6
**PostgreSQL Version:** 16+
**Authentication:** JWT (djangorestframework-simplejwt)