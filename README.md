# ACDC HR Application

A Django-based HR management application using PostgreSQL for managing employee information with JWT authentication and Role-Based Access Control (RBAC).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Authentication & User Management](#authentication--user-management)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
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
# You should see: people, django_session, auth_user, auth_group, auth_user_groups, token_blacklist_*, etc.
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

### 2. Initialize HR Role Groups (CRITICAL FOR RBAC)

Before registering HR staff users, you must create the role groups:

```bash
python manage.py create_hr_groups
```

This creates three role groups in the `auth_group` table:
- **HR_ReadOnly** - Can only view employee data
- **HR_ReadWrite** - Can view, create, and update employee data
- **HR_FullAccess** - Can perform all operations including delete

**Expected Output:**
```
Creating HR role groups...

✓ Created: HR_ReadOnly
  → Can view employee data only (GET requests)

✓ Created: HR_ReadWrite
  → Can view, create, and update employee data (GET, POST, PATCH)

✓ Created: HR_FullAccess
  → Can perform all operations including delete (GET, POST, PATCH, DELETE)

============================================================
Summary:
  Groups created: 3
  Groups already existed: 0
  Total HR role groups: 3
============================================================

✓ Successfully created 3 new HR role group(s)!
```

**Note:** This command is idempotent - safe to run multiple times.

### 3. Start the Development Server

```bash
python manage.py runserver
```

The server will start at: `http://127.0.0.1:8000/`

### 4. Access the Admin Panel

Navigate to: `http://127.0.0.1:8000/admin/`

Login with your superuser credentials.

You should see:
- **People** section with **Persons** management
- **Authentication and Authorization** section with **Groups** and **Users**
- Ability to add, edit, and view employee records

### 5. Test the Database Connection

Open Django shell:
```bash
python manage.py shell
```

Run test commands:
```python
from people.models import Person
from django.contrib.auth.models import Group

# Check existing records
print(f"Employees: {Person.objects.count()}")
print(f"Role groups: {Group.objects.count()}")

# List role groups
for group in Group.objects.all():
    print(f"  - {group.name}")

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

### 1. User Registration (Superuser Only)

**IMPORTANT:** User registration is restricted to superusers only. Only the Head HR (superuser) can create new user accounts.

**Endpoint:** `POST /api/register/`

**Headers:**
```
Authorization: Bearer <SUPERUSER_ACCESS_TOKEN>
Content-Type: application/json
```

**Request Body (WITH RBAC ROLE):**
```json
{
  "username": "john_doe",
  "email": "john@acdcco.org",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "HR_ReadWrite"
}
```

**Valid Role Options:**
- `HR_ReadOnly` - Can only view employee data
- `HR_ReadWrite` - Can view, create, and update employee data
- `HR_FullAccess` - Can perform all operations including delete

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Authorization: Bearer YOUR_SUPERUSER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@acdcco.org",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "HR_ReadWrite"
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
    "last_name": "Doe",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2024-12-01T10:30:00Z",
    "last_login": null,
    "role": "HR_ReadWrite"
  },
  "message": "User registered successfully! You can now login."
}
```

**Validation:**
- Username must be unique (3+ characters, no spaces)
- Email must be unique and valid
- Password must be strong (8+ characters, not common)
- password and password2 must match
- **role must be one of the three valid HR roles**
- **Only superusers can register new users** (403 Forbidden otherwise)

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
  "date_joined": "2024-12-01T14:30:38.123456Z",
  "last_login": "2024-12-01T15:00:00.000000Z",
  "role": "HR_ReadWrite"
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

### 7. List All Users (Superuser Only)

Get a list of all registered users with their roles:

**Endpoint:** `GET /api/users/`

**Headers:**
```
Authorization: Bearer YOUR_SUPERUSER_ACCESS_TOKEN_HERE
```

**cURL Example:**
```bash
curl http://127.0.0.1:8000/api/users/ \
  -H "Authorization: Bearer YOUR_SUPERUSER_ACCESS_TOKEN"
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
    "date_joined": "2024-11-01T10:00:00Z",
    "role": "Superuser"
  },
  {
    "id": 3,
    "username": "john_doe",
    "email": "john@acdcco.org",
    "first_name": "John",
    "last_name": "Doe",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2024-12-01T14:30:38Z",
    "role": "HR_ReadWrite"
  }
]
```

### Complete Authentication Flow

```
1. Superuser Creates HR Staff Account
   POST /api/register/ (with role) → User created with assigned role

2. HR Staff Login
   POST /api/token/ → Returns access + refresh tokens

3. Access Protected API (Based on Role)
   GET /api/employees/ → Returns data if user has READ permission
   POST /api/employees/ → Works if user has WRITE permission
   DELETE /api/employees/1/ → Works if user has DELETE permission (FullAccess only)

4. Access Token Expires (after 60 min)
   Any API call → 401 Unauthorized "Token expired"

5. Refresh Token
   POST /api/token/refresh/ → Returns new access token

6. Continue Using API
   API calls with new token → Works again

7. User Logout
   POST /api/token/blacklist/ → Refresh token invalidated
   
8. Must Login Again
   POST /api/token/ → Get new tokens
```

---

## Role-Based Access Control (RBAC)

The application implements a three-tier role-based access control system for HR staff.

### Role Hierarchy

```
Superuser (Head HR)
    ↓
HR_FullAccess
    ↓
HR_ReadWrite
    ↓
HR_ReadOnly
```

### Role Definitions

#### 1. **Superuser (Head HR)**
- **Capabilities:** Full system access
- **Can do:**
  - Everything HR_FullAccess can do
  - Create new user accounts
  - Assign roles to users
  - Access user management endpoints
  - Access Django admin panel
- **Cannot be assigned as a role** - Created via `python manage.py createsuperuser`

#### 2. **HR_FullAccess**
- **Capabilities:** Full employee data management
- **Can do:**
  - ✅ View all employee data (GET)
  - ✅ Create new employees (POST)
  - ✅ Update employee information (PUT, PATCH)
  - ✅ Delete employees (DELETE)
- **Cannot do:**
  - ❌ Create user accounts
  - ❌ Assign roles to users
  - ❌ Modify their own role

#### 3. **HR_ReadWrite**
- **Capabilities:** Can manage employee data except deletions
- **Can do:**
  - ✅ View all employee data (GET)
  - ✅ Create new employees (POST)
  - ✅ Update employee information (PUT, PATCH)
- **Cannot do:**
  - ❌ Delete employees
  - ❌ Create user accounts
  - ❌ Assign roles to users

#### 4. **HR_ReadOnly**
- **Capabilities:** View-only access
- **Can do:**
  - ✅ View all employee data (GET)
  - ✅ Filter and search employees
- **Cannot do:**
  - ❌ Create new employees
  - ❌ Update employee information
  - ❌ Delete employees
  - ❌ Create user accounts

### Permission Matrix

| Endpoint | Method | ReadOnly | ReadWrite | FullAccess | Superuser |
|----------|--------|----------|-----------|------------|-----------|
| `/api/employees/` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/employees/{id}/` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/employees/filter_employees/` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/employees/` | POST | ❌ | ✅ | ✅ | ✅ |
| `/api/employees/{id}/` | PUT/PATCH | ❌ | ✅ | ✅ | ✅ |
| `/api/employees/update_by_identifier/` | PATCH | ❌ | ✅ | ✅ | ✅ |
| `/api/employees/{id}/` | DELETE | ❌ | ❌ | ✅ | ✅ |
| `/api/employees/delete_by_identifier/` | DELETE | ❌ | ❌ | ✅ | ✅ |
| `/api/register/` | POST | ❌ | ❌ | ❌ | ✅ |
| `/api/users/` | GET | ❌ | ❌ | ❌ | ✅ |

### RBAC Implementation Details

**Backend Components:**
1. **Django Groups** (`auth_group` table)
   - Stores the three role definitions
   - Created via `python manage.py create_hr_groups`

2. **User-Group Relationship** (`auth_user_groups` table)
   - Links users to their assigned roles
   - One user = one role (enforced during registration)

3. **Custom Permission Classes** (`people/permissions.py`)
   - `IsReadOnlyOrAbove` - Allows any HR role
   - `IsReadWriteOrAbove` - Allows ReadWrite and FullAccess
   - `IsFullAccessUser` - Allows FullAccess only
   - `IsSuperUserOnly` - Allows superusers only

4. **ViewSet Permission Mapping** (`people/views.py`)
   - Different actions use different permission classes
   - Enforced via `get_permissions()` method

### Creating Users with Different Roles

**Example 1: Create ReadOnly User**
```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Authorization: Bearer SUPERUSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "viewer_user",
    "email": "viewer@acdcco.org",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "View",
    "last_name": "Only",
    "role": "HR_ReadOnly"
  }'
```

**Example 2: Create ReadWrite User**
```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Authorization: Bearer SUPERUSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "editor_user",
    "email": "editor@acdcco.org",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Edit",
    "last_name": "User",
    "role": "HR_ReadWrite"
  }'
```

**Example 3: Create FullAccess User**
```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Authorization: Bearer SUPERUSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "manager_user",
    "email": "manager@acdcco.org",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Manager",
    "last_name": "User",
    "role": "HR_FullAccess"
  }'
```

### Testing RBAC

#### Test 1: ReadOnly User Cannot Create Employees

```bash
# Login as ReadOnly user
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "viewer_user",
    "password": "SecurePass123!"
  }'

# Try to create employee (should fail)
curl -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Authorization: Bearer READONLY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Person",
    "department": "Engineering",
    "start_date": "2024-01-01",
    "status": "active"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "detail": "You need at least Read-Write access to create or modify employee data. Your current role only allows viewing."
}
```

#### Test 2: ReadWrite User Cannot Delete Employees

```bash
# Login as ReadWrite user
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "editor_user",
    "password": "SecurePass123!"
  }'

# Try to delete employee (should fail)
curl -X DELETE http://127.0.0.1:8000/api/employees/1/ \
  -H "Authorization: Bearer READWRITE_USER_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "detail": "You need Full Access role to delete employee data. Your current role does not allow deletions."
}
```

#### Test 3: FullAccess User Can Delete Employees

```bash
# Login as FullAccess user
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "manager_user",
    "password": "SecurePass123!"
  }'

# Delete employee (should succeed)
curl -X DELETE http://127.0.0.1:8000/api/employees/1/ \
  -H "Authorization: Bearer FULLACCESS_USER_TOKEN"
```

**Expected Response (204 No Content):**
```
(Empty response with 204 status code - deletion successful)
```

### Verifying User Roles in Database

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User, Group

# Get user and their role
user = User.objects.get(username='editor_user')
user_role = user.groups.first()
print(f"{user.username}: {user_role.name if user_role else 'No role'}")

# List all users with their roles
for user in User.objects.all():
    if user.is_superuser:
        role = "Superuser"
    else:
        group = user.groups.first()
        role = group.name if group else "No role"
    print(f"{user.username}: {role}")

# Check specific role membership
user = User.objects.get(username='editor_user')
is_readonly = user.groups.filter(name='HR_ReadOnly').exists()
is_readwrite = user.groups.filter(name='HR_ReadWrite').exists()
is_fullaccess = user.groups.filter(name='HR_FullAccess').exists()

print(f"ReadOnly: {is_readonly}")
print(f"ReadWrite: {is_readwrite}")
print(f"FullAccess: {is_fullaccess}")

exit()
```

### RBAC Security Features

✅ **Role Assignment During Registration**
- Users are assigned roles when their account is created
- No "orphaned" users without roles

✅ **Superuser Privilege Protection**
- Only superusers can create accounts and assign roles
- HR staff cannot escalate their privileges

✅ **Self-Modification Prevention**
- Users cannot change their own role
- Prevents privilege escalation

✅ **Granular Permission Control**
- Different endpoints require different permission levels
- Clear error messages when access is denied

✅ **Audit Trail**
- Deletion and update operations log who performed them
- Uses `request.user.username` in responses

---

## API Testing

The application provides REST API endpoints for managing employee data with role-based access control.

### Prerequisites
- Ensure the development server is running:
```bash
python manage.py runserver
```
- Have a valid JWT access token with appropriate role

### Available Endpoints

#### 1. List All Employees (READ Permission Required)

**Allowed Roles:** HR_ReadOnly, HR_ReadWrite, HR_FullAccess, Superuser

```bash
GET http://127.0.0.1:8000/api/employees/
```

**With Authentication:**
```bash
curl http://127.0.0.1:8000/api/employees/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Create Employee (WRITE Permission Required)

**Allowed Roles:** HR_ReadWrite, HR_FullAccess, Superuser  
**Denied Roles:** HR_ReadOnly

```bash
POST http://127.0.0.1:8000/api/employees/
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "department": "Marketing",
    "start_date": "2024-01-15",
    "status": "active",
    "acdc_email": "jane.smith@acdcco.org"
  }'
```

#### 3. Update Employee (WRITE Permission Required)

**Allowed Roles:** HR_ReadWrite, HR_FullAccess, Superuser  
**Denied Roles:** HR_ReadOnly

```bash
PATCH http://127.0.0.1:8000/api/employees/{id}/
```

**Example:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/employees/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Sales",
    "status": "on_leave"
  }'
```

#### 4. Delete Employee (DELETE Permission Required)

**Allowed Roles:** HR_FullAccess, Superuser ONLY  
**Denied Roles:** HR_ReadOnly, HR_ReadWrite

```bash
DELETE http://127.0.0.1:8000/api/employees/{id}/
```

**Example:**
```bash
curl -X DELETE http://127.0.0.1:8000/api/employees/1/ \
  -H "Authorization: Bearer YOUR_FULLACCESS_TOKEN"
```

#### 5. Filter Employees (READ Permission Required)

**Allowed Roles:** HR_ReadOnly, HR_ReadWrite, HR_FullAccess, Superuser

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

#### 6. Delete Employee by Email (DELETE Permission Required)

**Allowed Roles:** HR_FullAccess, Superuser ONLY

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
  -H "Authorization: Bearer YOUR_FULLACCESS_TOKEN"
```

#### 7. Update Employee by Email (WRITE Permission Required)

**Allowed Roles:** HR_ReadWrite, HR_FullAccess, Superuser

```bash
PATCH http://127.0.0.1:8000/api/employees/update_by_identifier/?email=john.doe@acdcco.org
Body: {"department": "Sales", "status": "on_leave"}
```

**With Authentication:**
```bash
curl -X PATCH "http://127.0.0.1:8000/api/employees/update_by_identifier/?email=john.doe@acdcco.org" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Sales",
    "status": "on_leave"
  }'
```

### Response Codes

- **200 OK** - Successful GET, PUT, PATCH request
- **201 Created** - Successful POST request (new resource created)
- **204 No Content** - Successful DELETE request
- **400 Bad Request** - Validation error or missing required fields
- **401 Unauthorized** - No authentication token or invalid token
- **403 Forbidden** - Insufficient permissions for the requested action
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Multiple resources found (e.g., duplicate names)

---

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

### Issue: "You need at least Read-Write access..." (403 Forbidden)

**Solution:**
- Your user role doesn't have permission for this action
- Check your role: `GET /api/profile/` to see your current role
- Contact superuser (Head HR) to upgrade your role if needed
- Cannot upgrade your own role - this is by design for security

### Issue: Role groups don't exist / "Role 'HR_ReadWrite' does not exist"

**Solution:**
```bash
# Run the management command to create role groups
python manage.py create_hr_groups

# Verify groups were created
python manage.py shell
from django.contrib.auth.models import Group
for group in Group.objects.all():
    print(group.name)
exit()
```

### Issue: User has no role assigned

**Solution:**
```bash
# Check user's role
python manage.py shell
from django.contrib.auth.models import User, Group

user = User.objects.get(username='username_here')
groups = user.groups.all()

if not groups:
    print("User has no role assigned")
    # Assign a role
    role = Group.objects.get(name='HR_ReadWrite')
    user.groups.add(role)
    print(f"Assigned {role.name} to {user.username}")

exit()
```

### Issue: Cannot register users / "You do not have permission to perform this action"

**Solution:**
- Only superusers can register new users
- Login with a superuser account to create new HR staff accounts
- Regular HR staff (even FullAccess) cannot create user accounts
- This is by design to prevent unauthorized account creation

---

**Last Updated:** December 2024  
**Django Version:** 5.2.6  
**PostgreSQL Version:** 16+  
**Authentication:** JWT (djangorestframework-simplejwt)  
**Authorization:** Role-Based Access Control (RBAC) with 3 HR roles