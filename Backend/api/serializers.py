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
            'material_type', 'flashcard_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            'id', 'question', 'answer', 'difficulty',
            'study_material', 'times_reviewed', 'last_reviewed', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            'id', 'title', 'duration_minutes', 'notes', 'date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'session_id', 'created_at']
        read_only_fields = ['id', 'created_at']
