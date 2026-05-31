from rest_framework import serializers
from .models import StudyMaterial, Flashcard, StudySession, ChatMessage


class StudyMaterialSerializer(serializers.ModelSerializer):
    flashcard_count = serializers.IntegerField(
        source='flashcards.count', read_only=True
    )

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'title', 'description', 'content', 'file_url',
            'file', 'extracted_text',
            'material_type', 'flashcard_count', 'created_at', 'updated_at',
            'owner',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            'id', 'question', 'answer', 'difficulty',
            'study_material', 'times_reviewed', 'last_reviewed',
            'easiness_factor', 'interval_days', 'repetitions', 'next_review_date',
            'created_at', 'owner',
        ]
        read_only_fields = ['id', 'created_at', 'owner']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'id', 'title', 'duration_minutes', 'notes', 'date', 'created_at',
            'owner',
        ]
        read_only_fields = ['id', 'created_at', 'owner']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'session_id', 'created_at', 'owner']
        read_only_fields = ['id', 'created_at', 'owner']
