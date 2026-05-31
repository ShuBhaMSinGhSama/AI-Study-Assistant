import google.generativeai as genai
from django.conf import settings


class AIService:
    """Wrapper around Google Gemini API for study assistance."""

    SYSTEM_PROMPT = (
        "You are an AI Study Assistant — a friendly, knowledgeable tutor "
        "who helps students learn effectively. You can explain concepts, "
        "answer questions, quiz students, summarize notes, and provide "
        "study tips. Be clear, encouraging, and use examples where helpful. "
        "Format your responses with markdown for readability. "
        "Keep responses focused and educational."
    )

    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Add it to your .env file."
            )
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash',
            system_instruction=self.SYSTEM_PROMPT,
        )

    def chat(self, user_message, history=None, context=None):
        """
        Send a message to Gemini with optional conversation history and study material context.
        
        Args:
            user_message: The user's current message
            history: List of dicts with 'role' and 'content' keys
            context: Optional study material text to provide as context
        
        Returns:
            The AI response text
        """
        chat_history = []
        
        # Add study material context if provided
        if context:
            chat_history.append({
                'role': 'user',
                'parts': [f"Here is my study material for reference:\n\n{context[:8000]}"]
            })
            chat_history.append({
                'role': 'model',
                'parts': ["I've reviewed your study material. I'm ready to help you learn! What would you like to know?"]
            })
        
        # Add conversation history
        if history:
            for msg in history[-20:]:  # Last 20 messages for context window
                role = 'model' if msg['role'] == 'assistant' else 'user'
                chat_history.append({
                    'role': role,
                    'parts': [msg['content']]
                })
        
        chat = self.model.start_chat(history=chat_history)
        response = chat.send_message(user_message)
        return response.text

    def generate_flashcards(self, content, num_cards=10):
        """
        Generate flashcards from study material content.
        
        Args:
            content: The study material text
            num_cards: Number of flashcards to generate
        
        Returns:
            List of dicts with 'question', 'answer', 'difficulty' keys
        """
        prompt = f"""Analyze the following study material and generate exactly {num_cards} flashcards.

For each flashcard, provide:
- A clear, specific question
- A comprehensive but concise answer
- A difficulty level: "easy", "medium", or "hard"

Return ONLY a valid JSON array with no extra text. Each item should have keys: "question", "answer", "difficulty".

Example format:
[{{"question": "What is X?", "answer": "X is...", "difficulty": "easy"}}, ...]

Study Material:
{content[:10000]}"""
        
        response = self.model.generate_content(prompt)
        
        import json
        # Try to parse JSON from response
        text = response.text.strip()
        # Remove markdown code fences if present
        if text.startswith('```'):
            text = text.split('\n', 1)[1] if '\n' in text else text[3:]
        if text.endswith('```'):
            text = text[:-3]
        if text.startswith('json'):
            text = text[4:]
        text = text.strip()
        
        try:
            cards = json.loads(text)
            # Validate structure
            validated = []
            for card in cards:
                if 'question' in card and 'answer' in card:
                    validated.append({
                        'question': card['question'],
                        'answer': card['answer'],
                        'difficulty': card.get('difficulty', 'medium').lower(),
                    })
            return validated[:num_cards]
        except json.JSONDecodeError:
            raise ValueError("AI returned invalid flashcard data. Please try again.")


def get_ai_service():
    """Factory function to get an AIService instance."""
    return AIService()
