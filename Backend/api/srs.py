"""
SM-2 Spaced Repetition Algorithm
Based on: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

The SM-2 algorithm schedules flashcard reviews based on user performance.
After each review, the card is rescheduled with an increasing interval.

Quality ratings (0-5):
  0 — Complete blackout
  1 — Incorrect, but upon seeing the answer, it was remembered
  2 — Incorrect, but the answer was easy to recall once seen
  3 — Correct with serious difficulty
  4 — Correct after some hesitation
  5 — Perfect response

If quality < 3: repetition resets (card starts over)
If quality >= 3: interval increases based on easiness factor
"""

from datetime import timedelta
from django.utils import timezone


def calculate_sm2(quality, repetitions, easiness_factor, interval_days):
    """
    Calculate the next SM-2 parameters after a review.

    Args:
        quality: int 0–5, the user's self-assessed recall quality
        repetitions: int, number of consecutive correct reviews
        easiness_factor: float, the card's easiness factor (min 1.3)
        interval_days: int, the current interval in days

    Returns:
        dict with keys: repetitions, easiness_factor, interval_days, next_review_date
    """
    quality = max(0, min(5, int(quality)))

    # Update easiness factor (never below 1.3)
    new_ef = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(1.3, round(new_ef, 2))

    if quality < 3:
        # Failed — reset
        new_reps = 0
        new_interval = 1
    else:
        # Correct
        new_reps = repetitions + 1
        if new_reps == 1:
            new_interval = 1
        elif new_reps == 2:
            new_interval = 6
        else:
            new_interval = round(interval_days * new_ef)

    next_review = timezone.now() + timedelta(days=new_interval)

    return {
        'repetitions': new_reps,
        'easiness_factor': new_ef,
        'interval_days': new_interval,
        'next_review_date': next_review,
    }



def get_due_cards_qs(queryset):
    """
    Return flashcards due for review: never reviewed OR next_review_date <= now.
    """
    from django.db.models import Q
    now = timezone.now()
    return queryset.filter(
        Q(next_review_date__isnull=True) | Q(next_review_date__lte=now)
    )
