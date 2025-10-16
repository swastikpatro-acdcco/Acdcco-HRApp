from django.contrib import admin


from .models import Person

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = [
        'full_name', 
        'department', 
        'position', 
        'status', 
        'start_date',
        'is_active_member'
    ]
    
    # Fields you can filter by in the sidebar
    list_filter = [
        'status', 
        'department', 
        'start_date'
    ]
    
    # Fields you can search
    search_fields = [
        'full_name', 
        'acdc_email', 
        'department'
    ]
    
    # Fields to organize in the edit form
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'acdc_email', 'personal_email', 'phone')
        }),
        ('Employment Details', {
            'fields': ('department', 'subteam', 'position', 'status', 'timezone', 'time_commitment')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
    )
    
    # Read-only fields (timestamps)
    readonly_fields = ['created_at', 'updated_at']
    
    # Default ordering
    ordering = ['full_name']
    
    # How many items per page
    list_per_page = 25
