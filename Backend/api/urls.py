from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    health_check,
    chat_with_ai,
    dashboard_stats,
    StudyMaterialViewSet,
    FlashcardViewSet,
    StudySessionViewSet,
    ChatMessageViewSet,
)

router = DefaultRouter()
router.register(r'study-materials', StudyMaterialViewSet, basename='studymaterial')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')
router.register(r'study-sessions', StudySessionViewSet, basename='studysession')
router.register(r'chat-messages', ChatMessageViewSet, basename='chatmessage')

urlpatterns = [
    # Original health-check
    path('status/', health_check, name='status'),

    # Custom endpoints
    path('chat/', chat_with_ai, name='chat_with_ai'),
    path('dashboard/', dashboard_stats, name='dashboard_stats'),

    # DRF router (all CRUD endpoints)
    path('', include(router.urls)),
]