"""
Django Management Command: Create HR Role Groups

This command creates the 3 role groups in the auth_group table:
1. HR_ReadOnly - Can only view employee data
2. HR_ReadWrite - Can view, create, and update employee data
3. HR_FullAccess - Can view, create, update, and delete employee data

Run this command once during initial setup:
    python manage.py create_hr_groups

The command is idempotent - safe to run multiple times.
It will only create groups that don't already exist.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = 'Creates the three HR role groups for RBAC: HR_ReadOnly, HR_ReadWrite, HR_FullAccess'

    def handle(self, *args, **kwargs):
        """
        Create the 3 HR role groups in auth_group table
        """
        # Define the three roles
        roles = [
            {
                'name': 'HR_ReadOnly',
                'description': 'Can view employee data only (GET requests)'
            },
            {
                'name': 'HR_ReadWrite', 
                'description': 'Can view, create, and update employee data (GET, POST, PATCH)'
            },
            {
                'name': 'HR_FullAccess',
                'description': 'Can perform all operations including delete (GET, POST, PATCH, DELETE)'
            }
        ]

        self.stdout.write(self.style.NOTICE('Creating HR role groups...\n'))

        created_count = 0
        existing_count = 0

        for role_info in roles:
            role_name = role_info['name']
            description = role_info['description']
            
            # get_or_create returns (object, created) tuple
            group, created = Group.objects.get_or_create(name=role_name)
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {role_name}')
                )
                self.stdout.write(f'  → {description}\n')
            else:
                existing_count += 1
                self.stdout.write(
                    self.style.WARNING(f'○ Already exists: {role_name}')
                )
                self.stdout.write(f'  → {description}\n')

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.NOTICE('Summary:'))
        self.stdout.write(f'  Groups created: {created_count}')
        self.stdout.write(f'  Groups already existed: {existing_count}')
        self.stdout.write(f'  Total HR role groups: {len(roles)}')
        self.stdout.write('='*60 + '\n')

        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Successfully created {created_count} new HR role group(s)!'
                )
            )
        
        if existing_count == len(roles):
            self.stdout.write(
                self.style.SUCCESS(
                    '\n✓ All HR role groups already exist. No action needed.'
                )
            )

        # Show what's in the database now
        self.stdout.write('\n' + self.style.NOTICE('Current groups in database:'))
        all_groups = Group.objects.all().order_by('name')
        for group in all_groups:
            self.stdout.write(f'  - {group.name} (ID: {group.id})')
        
        self.stdout.write('\n' + self.style.SUCCESS('Done! You can now assign these roles to users during registration.'))