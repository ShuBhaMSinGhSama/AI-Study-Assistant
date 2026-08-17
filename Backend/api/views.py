import uuid

from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            qs = qs.filter(owner=self.request.user)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save(owner=self.request.user)
        # Extract text from uploaded PDF
        if instance.file and instance.file.name.endswith('.pdf'):
            try:
                import pdfplumber
                text_parts = []
                with pdfplumber.open(instance.file.path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(page_text)
                instance.extracted_text = '\n\n'.join(text_parts)
                instance.save(update_fields=['extracted_text'])
            except Exception as e:
                import os
                from rest_framework.exceptions import ValidationError
                
                if instance.file and os.path.isfile(instance.file.path):
                    os.remove(instance.file.path)
                instance.delete()
                
                raise ValidationError({
                    "file": f"Failed to extract text from PDF. The file may be corrupted or image-based. ({str(e)})"
                })


class FlashcardViewSet(viewsets.ModelViewSet):
    """Full CRUD for flashcards, optionally filtered by study_material."""
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Flashcard.objects.all()
        if self.request.user.is_authenticated:
            qs = qs.filter(owner=self.request.user)
        material_id = self.request.query_params.get('study_material')
        if material_id:
            qs = qs.filter(study_material_id=material_id)
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StudySessionViewSet(viewsets.ModelViewSet):
    """Full CRUD for study sessions."""
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            qs = qs.filter(owner=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ChatMessageViewSet(viewsets.ModelViewSet):
    """Full CRUD for chat messages, filterable by session_id."""
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ChatMessage.objects.all()
        if self.request.user.is_authenticated:
            qs = qs.filter(owner=self.request.user)
        session_id = self.request.query_params.get('session_id')
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# ---------------------------------------------------------------------------
# AI Chat endpoint
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Accept a user message and return an AI response via Gemini.
    POST body: { "message": "...", "session_id": "..." (optional) }
    """
    user_message = request.data.get('message', '').strip()
    if not user_message:
        return Response(
            {"error": "Message content is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    session_id = request.data.get('session_id') or str(uuid.uuid4())

    # Persist the user message
    ChatMessage.objects.create(
        role='user',
        content=user_message,
        session_id=session_id,
        owner=request.user if request.user.is_authenticated else None,
    )

    # Build conversation history from this session (filtered by owner)
    history_qs = ChatMessage.objects.filter(
        session_id=session_id,
        owner=request.user,
    ).order_by('created_at').values('role', 'content')
    history = list(history_qs)[:-1]  # Exclude the message we just created

    # Try real AI, fall back to mock
    try:
        from .ai_service import get_ai_service
        ai = get_ai_service()
        ai_response = ai.chat(user_message, history=history)
    except Exception as e:
        # Fallback mock response if AI is not configured
        ai_response = (
            f"I received your message: \"{user_message}\". "
            "The AI service is not yet configured. Please add your "
            "GEMINI_API_KEY to the .env file to enable AI responses. "
            f"(Error: {str(e)})"
        )

    # Persist the assistant message
    assistant_msg = ChatMessage.objects.create(
        role='assistant',
        content=ai_response,
        session_id=session_id,
        owner=request.user if request.user.is_authenticated else None,
    )

    return Response({
        "session_id": session_id,
        "user_message": user_message,
        "ai_response": ai_response,
        "message_id": str(assistant_msg.id),
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Generate Flashcards endpoint
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_flashcards_view(request):
    """
    Generate flashcards from a study material using AI.
    POST body: { "study_material_id": "...", "num_cards": 10 }
    """
    material_id = request.data.get('study_material_id')
    num_cards = request.data.get('num_cards', 10)

    if not material_id:
        return Response(
            {"error": "study_material_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        material = StudyMaterial.objects.get(id=material_id, owner=request.user)
    except StudyMaterial.DoesNotExist:
        return Response(
            {"error": "Study material not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Use extracted_text first, fall back to content
    text = material.extracted_text or material.content
    if not text.strip():
        return Response(
            {"error": "This material has no text content to generate flashcards from."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        from .ai_service import get_ai_service
        ai = get_ai_service()
        cards_data = ai.generate_flashcards(text, num_cards=num_cards)
    except Exception as e:
        return Response(
            {"error": f"Failed to generate flashcards: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Create flashcard objects
    created_cards = []
    for card_data in cards_data:
        card = Flashcard.objects.create(
            question=card_data['question'],
            answer=card_data['answer'],
            difficulty=card_data.get('difficulty', 'medium'),
            study_material=material,
            owner=request.user if request.user.is_authenticated else None,
        )
        created_cards.append(FlashcardSerializer(card).data)

    return Response({
        "generated": len(created_cards),
        "flashcards": created_cards,
    }, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Return aggregate counts for the dashboard overview."""
    user = request.user
    total_materials = StudyMaterial.objects.filter(owner=user).count()
    total_flashcards = Flashcard.objects.filter(owner=user).count()
    total_sessions = StudySession.objects.filter(owner=user).count()
    total_chats = ChatMessage.objects.filter(owner=user).count()

    # Flashcard difficulty breakdown
    flashcard_breakdown = {
        'easy': Flashcard.objects.filter(owner=user, difficulty='easy').count(),
        'medium': Flashcard.objects.filter(owner=user, difficulty='medium').count(),
        'hard': Flashcard.objects.filter(owner=user, difficulty='hard').count(),
    }

    # Material type breakdown
    material_breakdown = {
        'pdf': StudyMaterial.objects.filter(owner=user, material_type='pdf').count(),
        'note': StudyMaterial.objects.filter(owner=user, material_type='note').count(),
        'link': StudyMaterial.objects.filter(owner=user, material_type='link').count(),
    }

    return Response({
        "total_materials": total_materials,
        "total_flashcards": total_flashcards,
        "total_sessions": total_sessions,
        "total_chat_messages": total_chats,
        "flashcard_breakdown": flashcard_breakdown,
        "material_breakdown": material_breakdown,
    })


# ---------------------------------------------------------------------------
# Spaced Repetition Review
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_flashcard(request):
    """
    Submit a review for a flashcard using SM-2 algorithm.
    POST body: { "flashcard_id": "...", "quality": 0-5 }

    Quality scale:
      0 — Complete blackout
      1 — Incorrect, remembered after seeing answer
      2 — Incorrect, easy to recall once seen
      3 — Correct with serious difficulty
      4 — Correct after hesitation
      5 — Perfect response
    """
    flashcard_id = request.data.get('flashcard_id')
    quality = request.data.get('quality')

    if not flashcard_id:
        return Response(
            {"error": "flashcard_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quality is None:
        return Response(
            {"error": "quality is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        quality_int = int(quality)
    except (ValueError, TypeError):
        return Response(
            {"error": "quality must be an integer between 0 and 5."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not (0 <= quality_int <= 5):
        return Response(
            {"error": "quality must be an integer between 0 and 5."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        card = Flashcard.objects.get(id=flashcard_id)
    except Flashcard.DoesNotExist:
        return Response(
            {"error": "Flashcard not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check ownership
    if card.owner and card.owner != request.user:
        return Response(
            {"error": "Not authorized."},
            status=status.HTTP_403_FORBIDDEN,
        )

    from .srs import calculate_sm2
    from django.utils import timezone

    result = calculate_sm2(
        quality=quality_int,
        repetitions=card.repetitions,
        easiness_factor=card.easiness_factor,
        interval_days=card.interval_days,
    )

    card.repetitions = result['repetitions']
    card.easiness_factor = result['easiness_factor']
    card.interval_days = result['interval_days']
    card.next_review_date = result['next_review_date']
    card.times_reviewed += 1
    card.last_reviewed = timezone.now()

    # Map quality to difficulty label for display
    if quality_int >= 4:
        card.difficulty = 'easy'
    elif quality_int >= 3:
        card.difficulty = 'medium'
    else:
        card.difficulty = 'hard'

    card.save()

    return Response({
        "flashcard": FlashcardSerializer(card).data,
        "next_review_date": result['next_review_date'].isoformat(),
        "interval_days": result['interval_days'],
        "message": f"Card reviewed! Next review in {result['interval_days']} day(s).",
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def due_flashcards(request):
    """
    Return flashcards that are due for review (next_review_date <= now, or never reviewed).
    """
    from django.db.models import Q
    from django.utils import timezone

    qs = Flashcard.objects.all()
    if request.user.is_authenticated:
        qs = qs.filter(owner=request.user)

    now = timezone.now()
    due = qs.filter(
        Q(next_review_date__isnull=True) | Q(next_review_date__lte=now)
    ).order_by('next_review_date', 'created_at')

    serializer = FlashcardSerializer(due, many=True)
    return Response({
        "count": due.count(),
        "results": serializer.data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_feed(request):
    """
    Returns an aggregated list of recent user activities.
    """
    from django.utils.timesince import timesince
    user = request.user
    activities = []
    
    # 1. Study Materials
    materials = StudyMaterial.objects.filter(owner=user).order_by('-created_at')[:5]
    for m in materials:
        activities.append({
            'id': f"mat_{m.id}",
            'icon': '📄',
            'text': f'Uploaded "{m.title}"',
            'timestamp': m.created_at,
            'time': f"{timesince(m.created_at)} ago",
            'color': 'var(--accent-primary)'
        })

    # 2. Flashcards Created
    flashcards = Flashcard.objects.filter(owner=user).order_by('-created_at')[:5]
    for f in flashcards:
        mat_title = f.study_material.title if f.study_material else "General"
        activities.append({
            'id': f"fc_{f.id}",
            'icon': '🎴',
            'text': f'Created flashcard for "{mat_title}"',
            'timestamp': f.created_at,
            'time': f"{timesince(f.created_at)} ago",
            'color': 'var(--accent-secondary)'
        })

    # 3. Study Sessions
    sessions = StudySession.objects.filter(owner=user).order_by('-created_at')[:5]
    for s in sessions:
        activities.append({
            'id': f"ses_{s.id}",
            'icon': '📈',
            'text': f'Study session: {s.duration_minutes} min on "{s.title}"',
            'timestamp': s.created_at,
            'time': f"{timesince(s.created_at)} ago",
            'color': 'var(--color-info)'
        })

    # 4. Chat Messages
    chats = ChatMessage.objects.filter(owner=user, role='user').order_by('-created_at')[:5]
    for c in chats:
        activities.append({
            'id': f"chat_{c.id}",
            'icon': '💬',
            'text': f'AI chat: "{c.content[:30]}..."',
            'timestamp': c.created_at,
            'time': f"{timesince(c.created_at)} ago",
            'color': 'var(--accent-emerald)'
        })

    # Sort all by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Take top 10
    top_activities = activities[:10]
    
    # Remove timestamp object for JSON serialization
    for act in top_activities:
        del act['timestamp']

    return Response({
        "activities": top_activities
    })
