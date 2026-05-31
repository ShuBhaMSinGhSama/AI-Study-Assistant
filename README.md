# 🧠 AI Personal Study Assistant

A full-stack AI-powered study companion built with Django REST Framework + React. Features intelligent flashcard generation, spaced repetition review, AI-powered chat tutoring, PDF upload with text extraction, and comprehensive study session tracking.

## ✨ Features

- **🤖 AI Chat Tutor** — Chat with Google Gemini AI for personalized study help
- **📚 Study Materials** — Upload PDFs, create notes, save links with automatic text extraction
- **🎴 Smart Flashcards** — Create flashcards manually or generate them from materials using AI
- **📖 Spaced Repetition** — SM-2 algorithm-powered review mode that schedules cards optimally
- **📈 Study Sessions** — Track study time, log sessions, view weekly progress charts
- **📊 Dashboard** — Overview of all your study activity at a glance
- **🔐 User Authentication** — JWT-based auth with registration, login, and per-user data isolation

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7, Vanilla CSS (dark glassmorphism) |
| **Backend** | Django 5.2, Django REST Framework, SQLite |
| **AI** | Google Gemini 2.0 Flash (via `google-generativeai`) |
| **Auth** | JWT (djangorestframework-simplejwt) |
| **PDF** | pdfplumber for text extraction |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ 
- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Backend Setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv AI_stdy_venv
AI_stdy_venv\Scripts\activate    # Windows
# source AI_stdy_venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8000`.

### Environment Variables

Create `Backend/.env` from the template:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 📁 Project Structure

```
AI-Personal_stdy_Assistant/
├── Backend/
│   ├── api/
│   │   ├── models.py           # StudyMaterial, Flashcard, StudySession, ChatMessage
│   │   ├── views.py            # CRUD ViewSets + AI chat/generation endpoints
│   │   ├── serializers.py      # DRF serializers for all models
│   │   ├── urls.py             # API URL routing
│   │   ├── ai_service.py       # Google Gemini AI wrapper
│   │   ├── srs.py              # SM-2 spaced repetition algorithm
│   │   ├── auth_views.py       # Register, login, logout, profile
│   │   └── auth_serializers.py # User serializers
│   ├── core/
│   │   ├── settings.py         # Django settings with env vars
│   │   └── urls.py             # Root URL config
│   ├── .env.example            # Environment template
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, Chat, Materials, Flashcards, Sessions, ReviewMode, Login, Register
│   │   ├── components/         # Layout, Sidebar, TopBar, ProtectedRoute
│   │   ├── context/            # AuthContext (React Context for auth state)
│   │   ├── services/           # api.js (REST client), auth.js (JWT management)
│   │   ├── App.jsx             # Router setup
│   │   └── main.jsx            # App entry point
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (username or email) |
| POST | `/api/auth/logout/` | Logout (blacklist token) |
| GET | `/api/auth/profile/` | Get current user profile |
| POST | `/api/auth/token/refresh/` | Refresh JWT access token |

### Study Materials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/study-materials/` | List all materials |
| POST | `/api/study-materials/` | Create (supports file upload) |
| GET | `/api/study-materials/:id/` | Get single material |
| PATCH | `/api/study-materials/:id/` | Update material |
| DELETE | `/api/study-materials/:id/` | Delete material |

### Flashcards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flashcards/` | List all flashcards |
| POST | `/api/flashcards/` | Create flashcard |
| PATCH | `/api/flashcards/:id/` | Update flashcard |
| DELETE | `/api/flashcards/:id/` | Delete flashcard |
| POST | `/api/generate-flashcards/` | AI-generate from material |
| POST | `/api/review-flashcard/` | Submit SM-2 review |
| GET | `/api/due-flashcards/` | Get cards due for review |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Send message to AI tutor |
| GET | `/api/dashboard/` | Dashboard statistics |
| GET/POST | `/api/study-sessions/` | Study session CRUD |

## 📝 License

This project is for educational purposes.
