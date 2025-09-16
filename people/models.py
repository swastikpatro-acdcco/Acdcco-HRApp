from django.db import models

# Create your models here.
from django.core.exceptions import ValidationError

# -- Choice lists kept close to the model so the UI and backend stay in sync --
DEPARTMENT_CHOICES = [
    ("Engineering", "Engineering"),
    ("Product Management", "Product Management"),
    ("Design", "Design"),
    ("Sales", "Sales"),
    ("Marketing", "Marketing"),
    ("Executive", "Executive"),
    ("Human Resources", "Human Resources"),
    ("Finance", "Finance"),
]

POSITION_CHOICES = [
    ("Volunteer", "Volunteer"),
    ("Director", "Director"),
    ("Admin", "Admin"),
]


STATUS_CHOICES = [
    ("active", "Active"),
    ("inactive", "Inactive"),
    ("on_leave", "On Leave"),
]


class Person(models.Model):
    # -- Identity & contact --
    # Using full_name instead of first_name/last_name to match PostgreSQL
    full_name       = models.TextField(help_text="Full name of the person")
    acdc_email      = models.EmailField(unique=True, blank=True, null=True)
    personal_email  = models.EmailField(unique=True, blank=True, null=True)
    phone           = models.CharField(max_length=30, blank=True)

    # -- Employment --
    department      = models.TextField(choices=DEPARTMENT_CHOICES)  # Required field, no choices to match schema flexibility
    subteam         = models.TextField(blank=True, null=True)
    position        = models.TextField(choices=POSITION_CHOICES)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    timezone        = models.TextField(blank=True, null=True)
    
    # Changed to SmallIntegerField to match PostgreSQL SMALLINT with range check
    time_commitment = models.SmallIntegerField(
        blank=True, 
        null=True,
        help_text="Time commitment in hours (0-80)"
    )
    
    start_date      = models.DateField()
    end_date        = models.DateField(blank=True, null=True)

    # -- Audit fields --
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'people'  # Match PostgreSQL table name
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["department", "subteam"]),
            # Note: PostgreSQL has a trigram index on full_name, 
            # but Django doesn't have direct support for this
        ]
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.acdc_email})"

    def clean(self):
        # Validate full_name is not empty (trimmed length > 0)
        if not self.full_name or len(self.full_name.strip()) == 0:
            raise ValidationError({"full_name": "Full name cannot be empty."})
        
        # Start <= End date validation
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date cannot be before start date."})

        # Validate time_commitment range (0-80)
        if self.time_commitment is not None and not (0 <= self.time_commitment <= 80):
            raise ValidationError({"time_commitment": "Time commitment must be between 0 and 80 hours."})
        
        # Ensure emails are different if both are provided
        if (self.acdc_email and self.personal_email and 
            self.acdc_email.lower() == self.personal_email.lower()):
            raise ValidationError({"personal_email": "Personal email must be different from ACDC email."})

    @property
    def is_active_member(self) -> bool:
        """Check if person is an active member"""
        return self.status == "active" and (self.end_date is None)
    
    # Helper methods to extract first/last name if needed
    @property
    def first_name(self) -> str:
        """Extract first name from full_name"""
        return self.full_name.split()[0] if self.full_name else ""
    
    @property
    def last_name(self) -> str:
        """Extract last name from full_name"""
        parts = self.full_name.split() if self.full_name else []
        return " ".join(parts[1:]) if len(parts) > 1 else ""