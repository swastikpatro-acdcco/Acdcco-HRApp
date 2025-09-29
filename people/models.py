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

# Updated to match PostgreSQL enum exactly
STATUS_CHOICES = [
    ("active", "Active"),
    ("inactive", "Inactive"), 
    ("on_leave", "On Leave"),  # matches 'on_leave' in PostgreSQL
]


class Person(models.Model):
    # -- Identity & contact --
    # Using full_name to match PostgreSQL, with proper validation
    full_name = models.TextField(
        help_text="Full name of the person",
        # Django will handle the NOT NULL constraint
    )
    
    # Using TextField to match PostgreSQL CITEXT behavior
    # EmailField validation will still work, but storage matches CITEXT
    acdc_email = models.TextField(
        unique=True, 
        blank=True, 
        null=True,
        help_text="ACDC email address"
    )
    personal_email = models.TextField(
        unique=True, 
        blank=True, 
        null=True,
        help_text="Personal email address"
    )
    phone = models.TextField(blank=True, null=True)  # Changed to TextField to match PostgreSQL

    # -- Employment --
    # Department is required in PostgreSQL (NOT NULL)
    department = models.TextField(
        choices=DEPARTMENT_CHOICES,
        help_text="Department (required)"
        # null=False is Django default, matches PostgreSQL NOT NULL
    )
    subteam = models.TextField(blank=True, null=True)
    
    # Position allows NULL in PostgreSQL, so we should allow it in Django too
    position = models.TextField(
        choices=POSITION_CHOICES,
        blank=True, 
        null=True,  # Added to match PostgreSQL schema
        help_text="Position/Role"
    )
    
    # Status field matching PostgreSQL enum
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="active",
        help_text="Member status"
    )
    
    timezone = models.TextField(blank=True, null=True)
    
    # SmallIntegerField matches PostgreSQL SMALLINT with range check
    time_commitment = models.SmallIntegerField(
        blank=True, 
        null=True,
        help_text="Time commitment in hours (0-80)"
    )
    
    # Date fields match PostgreSQL exactly
    start_date = models.DateField(help_text="Start date (required)")
    end_date = models.DateField(blank=True, null=True, help_text="End date")

    # -- Audit fields --
    # Using DateTimeField to match PostgreSQL TIMESTAMPTZ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'people'  # Match PostgreSQL table name exactly
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["department", "subteam"]),
            # Note: PostgreSQL has trigram index on full_name
            # Django doesn't directly support this, but it will use the existing index
        ]
        ordering = ["full_name"]
        
        # Add constraints to match PostgreSQL schema
        constraints = [
            # This matches the PostgreSQL CHECK constraint
            models.CheckConstraint(
                condition=models.Q(time_commitment__gte=0) & models.Q(time_commitment__lte=80),
                name='time_commitment_range'
            ),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.acdc_email})"

    def clean(self):
        # Validate full_name is not empty (matches PostgreSQL CHECK)
        if not self.full_name or len(self.full_name.strip()) == 0:
            raise ValidationError({"full_name": "Full name cannot be empty."})
        
        # Start <= End date validation (matches PostgreSQL constraint)
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date cannot be before start date."})

        # Validate time_commitment range (matches PostgreSQL CHECK)
        if self.time_commitment is not None and not (0 <= self.time_commitment <= 80):
            raise ValidationError({"time_commitment": "Time commitment must be between 0 and 80 hours."})
        
        # Ensure emails are different (matches PostgreSQL constraint)
        if (self.acdc_email and self.personal_email and 
            self.acdc_email.lower() == self.personal_email.lower()):
            raise ValidationError({"personal_email": "Personal email must be different from ACDC email."})
        
        # Basic email validation for the text fields
        if self.acdc_email and '@' not in self.acdc_email:
            raise ValidationError({"acdc_email": "Invalid email format."})
        if self.personal_email and '@' not in self.personal_email:
            raise ValidationError({"personal_email": "Invalid email format."})

    def save(self, *args, **kwargs):
        # Run clean validation before saving
        self.clean()
        super().save(*args, **kwargs)

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