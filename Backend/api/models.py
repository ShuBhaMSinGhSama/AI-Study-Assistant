from django.conf import settings
from django.db import models
import uuid


class StudyMaterial(models.Model):
    """Represents uploaded study materials like PDFs, notes, or links."""

    MATERIAL_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('note', 'Note'),
        ('link', 'Link'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    content = models.TextField(blank=True, default='')
    file_url = models.URLField(max_length=500, blank=True, default='')
    file = models.FileField(upload_to='study_materials/', blank=True, null=True)
    extracted_text = models.TextField(blank=True, default='')
    material_type = models.CharField(
        max_length=10,
        choices=MATERIAL_TYPE_CHOICES,
        default='note',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_materials',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Flashcard(models.Model):
    """A flashcard linked to a study material for spaced-repetition review."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.TextField()
    answer = models.TextField()
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium',
    )
    study_material = models.ForeignKey(
        StudyMaterial,
        on_delete=models.CASCADE,
        related_name='flashcards',
        null=True,
        blank=True,
    )
    times_reviewed = models.PositiveIntegerField(default=0)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    # SM-2 Spaced Repetition fields
    easiness_factor = models.FloatField(default=2.5)
    interval_days = models.PositiveIntegerField(default=0)
    repetitions = models.PositiveIntegerField(default=0)
    next_review_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flashcards_owned',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.question[:80]


class StudySession(models.Model):
    """Tracks a timed study session with optional notes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    duration_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_sessions',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} ({self.date})"


class ChatMessage(models.Model):
    """Stores individual chat messages grouped by session_id."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    session_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"
