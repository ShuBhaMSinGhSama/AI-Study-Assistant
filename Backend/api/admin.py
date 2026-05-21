from django.contrib import admin
from .models import StudyMaterial, Flashcard, StudySession, ChatMessage


@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'material_type', 'created_at', 'updated_at')
    list_filter = ('material_type',)
    search_fields = ('title', 'description')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('question_preview', 'difficulty', 'times_reviewed', 'last_reviewed', 'created_at')
    list_filter = ('difficulty', 'study_material')
    search_fields = ('question', 'answer')

    @admin.display(description='Question')
    def question_preview(self, obj):
        return obj.question[:80]


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'duration_minutes', 'date', 'created_at')
    list_filter = ('date',)
    search_fields = ('title', 'notes')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('role', 'content_preview', 'session_id', 'created_at')
    list_filter = ('role',)
    search_fields = ('content',)

    @admin.display(description='Content')
    def content_preview(self, obj):
        return obj.content[:80]
