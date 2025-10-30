from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.core.validators import MinValueValidator, MaxValueValidator

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
    ("Manager", "Manager"),
    ("Asst. Director", "Asst. Director"),
    ("Director", "Director"),
]

# Matches explicit Postgres enum values
STATUS_CHOICES = [
    ("active", "Active"),
    ("inactive", "Inactive"),
    ("on_leave", "On Leave"),
]


class Person(models.Model):
    # -- Identity & contact --
    full_name = models.TextField(help_text="Full name of the person")

    # using TextField to mirror Postgres CITEXT (case-insensitive) behavior
    acdc_email = models.TextField(unique=True, blank=True, null=True, help_text="ACDC email address")
    personal_email = models.TextField(unique=True, blank=True, null=True, help_text="Personal email address")
    phone = models.TextField(blank=True, null=True)

    # -- Employment --
    # Allow any department name (UI can add new ones inline)
    department = models.TextField(help_text="Department (required)")
    subteam = models.TextField(blank=True, null=True)
    reports_to = models.TextField(blank=True, null=True, help_text="Manager/Supervisor")  # <— added

    position = models.TextField(choices=POSITION_CHOICES, blank=True, null=True, help_text="Position/Role")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active", help_text="Member status")

    timezone = models.TextField(blank=True, null=True)

    # Enforce 1–50 hours/week
    time_commitment = models.SmallIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        help_text="Time commitment in hours (1-50)",
    )

    start_date = models.DateField(help_text="Start date (required)")
    end_date = models.DateField(blank=True, null=True, help_text="End date")

    # -- Audit fields --
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "people"  # keep exact Postgres table name
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["department", "subteam"]),
        ]
        ordering = ["full_name"]
        constraints = [
            models.CheckConstraint(
                check=Q(time_commitment__gte=1) & Q(time_commitment__lte=50),
                name="time_commitment_range",
            ),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.acdc_email})"

    # Model-level validations mirroring DB constraints
    def clean(self):
        if not self.full_name or len(self.full_name.strip()) == 0:
            raise ValidationError({"full_name": "Full name cannot be empty."})

        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date cannot be before start date."})

        if self.time_commitment is not None and not (1 <= self.time_commitment <= 50):
            raise ValidationError({"time_commitment": "Time commitment must be between 1 and 50 hours."})

        if (
            self.acdc_email and self.personal_email and
            self.acdc_email.lower() == self.personal_email.lower()
        ):
            raise ValidationError({"personal_email": "Personal email must be different from ACDC email."})

        if self.acdc_email and "@" not in self.acdc_email:
            raise ValidationError({"acdc_email": "Invalid email format."})
        if self.personal_email and "@" not in self.personal_email:
            raise ValidationError({"personal_email": "Invalid email format."})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_active_member(self) -> bool:
        return self.status == "active" and (self.end_date is None)

    @property
    def first_name(self) -> str:
        return self.full_name.split()[0] if self.full_name else ""

    @property
    def last_name(self) -> str:
        parts = self.full_name.split() if self.full_name else []
        return " ".join(parts[1:]) if len(parts) > 1 else ""
