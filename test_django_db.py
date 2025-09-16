import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_portal.settings')
django.setup()

try:
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    result = cursor.fetchone()
    print(f"SUCCESS: Connected to PostgreSQL: {result[0]}")
except Exception as e:
    print(f"ERROR: {e}")
