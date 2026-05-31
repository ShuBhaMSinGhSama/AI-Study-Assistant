from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import register_view, login_view, logout_view, profile_view

from .views import (
    health_check,
    chat_with_ai,
    dashboard_stats,
    generate_flashcards_view,
    review_flashcard,
    due_flashcards,
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
    path('generate-flashcards/', generate_flashcards_view, name='generate_flashcards'),
    path('review-flashcard/', review_flashcard, name='review_flashcard'),
    path('due-flashcards/', due_flashcards, name='due_flashcards'),

    # DRF router (all CRUD endpoints)
    path('', include(router.urls)),

    # Auth endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/profile/', profile_view, name='profile'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]