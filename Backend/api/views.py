import uuid

from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import StudyMaterial, Flashcard, StudySession, ChatMessage
from .serializers import (
    StudyMaterialSerializer,
    FlashcardSerializer,
    StudySessionSerializer,
    ChatMessageSerializer,
)


# ---------------------------------------------------------------------------
# Health check (original)
# ---------------------------------------------------------------------------
def health_check(request):
    """Simple health-check endpoint to verify the backend is running."""
    return JsonResponse({
        "status": "connected",
        "project": "AI Personal Study Assistant",
        "message": "The bridge is open!",
    })


# ---------------------------------------------------------------------------
# CRUD ViewSets
# ---------------------------------------------------------------------------
class StudyMaterialViewSet(viewsets.ModelViewSet):
    """Full CRUD for study materials (PDFs, notes, links)."""
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer


class FlashcardViewSet(viewsets.ModelViewSet):
    """Full CRUD for flashcards, optionally filtered by study_material."""
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        material_id = self.request.query_params.get('study_material')
        if material_id:
            qs = qs.filter(study_material_id=material_id)
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs


class StudySessionViewSet(viewsets.ModelViewSet):
    """Full CRUD for study sessions."""
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    """Full CRUD for chat messages, filterable by session_id."""
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        session_id = self.request.query_params.get('session_id')
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs


# ---------------------------------------------------------------------------
# AI Chat endpoint (mock for now)
# ---------------------------------------------------------------------------
@api_view(['POST'])
def chat_with_ai(request):
    """
    Accept a user message and return a mock AI response.

    POST body: { "message": "...", "session_id": "..." (optional) }
    """
    user_message = request.data.get('message', '').strip()

    if not user_message:
        return Response(
            {"error": "Message content is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Use existing session or create a new one
    session_id = request.data.get('session_id') or str(uuid.uuid4())

    # Persist the user message
    ChatMessage.objects.create(
        role='user',
        content=user_message,
        session_id=session_id,
    )

    # --- Mock AI response logic ---
    if '?' in user_message:
        ai_response = (
            f"Great question! You asked: \"{user_message}\" — "
            "I'm still learning, but I'll be able to give you a real answer "
            "once my AI brain is plugged in. For now, keep studying hard! 📚"
        )
    else:
        ai_response = (
            f"Thanks for sharing: \"{user_message}\". "
            "I've noted that down. Once I'm connected to a real AI model, "
            "I'll be able to help you study this topic in depth! 🚀"
        )

    # Persist the assistant message
    assistant_msg = ChatMessage.objects.create(
        role='assistant',
        content=ai_response,
        session_id=session_id,
    )

    return Response({
        "session_id": session_id,
        "user_message": user_message,
        "ai_response": ai_response,
        "message_id": str(assistant_msg.id),
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------
@api_view(['GET'])
def dashboard_stats(request):
    """Return aggregate counts for the dashboard overview."""
    total_materials = StudyMaterial.objects.count()
    total_flashcards = Flashcard.objects.count()
    total_sessions = StudySession.objects.count()
    total_chats = ChatMessage.objects.count()

    # Flashcard difficulty breakdown
    flashcard_breakdown = {
        'easy': Flashcard.objects.filter(difficulty='easy').count(),
        'medium': Flashcard.objects.filter(difficulty='medium').count(),
        'hard': Flashcard.objects.filter(difficulty='hard').count(),
    }

    # Material type breakdown
    material_breakdown = {
        'pdf': StudyMaterial.objects.filter(material_type='pdf').count(),
        'note': StudyMaterial.objects.filter(material_type='note').count(),
        'link': StudyMaterial.objects.filter(material_type='link').count(),
    }

    return Response({
        "total_materials": total_materials,
        "total_flashcards": total_flashcards,
        "total_sessions": total_sessions,
        "total_chat_messages": total_chats,
        "flashcard_breakdown": flashcard_breakdown,
        "material_breakdown": material_breakdown,
    })
