from django.contrib import admin

# Register your models here.
from .models import Person

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    # Fields to display in the list view - only using fields that exist in models.py
    list_display = [
        'full_name', 
        'department', 
        'position', 
        'status', 
        'start_date'
    ]
    
    # Add filters in the right sidebar - only using fields that exist
    list_filter = [
        'status',
        'department', 
        'position',
        'start_date',
    ]
    
    # Enable search functionality - only using fields that exist
    search_fields = [
        'full_name',  # Changed from first_name/last_name 
        'acdc_email',
        'position'
    ]
    
    # Fields that should be read-only
    readonly_fields = ['created_at', 'updated_at']
    
    # Organize fields in the edit form - only using fields that exist
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'personal_email', 'phone')
        }),
        ('Employment Details', {
            'fields': ('acdc_email', 'department', 'subteam', 
                      'position', 'status', 'start_date', 'end_date')
        }),
        ('Work Details', {
            'fields': ('timezone', 'time_commitment')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    # Customize how many items show per page
    list_per_page = 25
    
    # Add bulk actions - updated to use correct status values
    actions = ['mark_as_inactive', 'mark_as_active']
    
    def mark_as_inactive(self, request, queryset):
        """Custom admin action to mark members as inactive"""
        updated = queryset.update(status='inactive')
        self.message_user(request, f'{updated} members marked as inactive.')
    mark_as_inactive.short_description = "Mark selected members as inactive"
    
    def mark_as_active(self, request, queryset):
        """Custom admin action to mark members as active"""
        updated = queryset.update(status='active')  # Changed from 'employee' to 'active'
        self.message_user(request, f'{updated} members marked as active.')
    mark_as_active.short_description = "Mark selected members as active"
