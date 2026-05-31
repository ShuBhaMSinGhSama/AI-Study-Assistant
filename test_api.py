"""
Comprehensive API & Security Test Suite
AI Personal Study Assistant
"""
import json
import sys
import os
import io
import requests
import time
import uuid

# Fix Windows console encoding for emoji
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE = "http://localhost:8000/api"
RESULTS = {"passed": 0, "failed": 0, "warnings": 0, "details": []}

def log(status, test_name, detail=""):
    icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️", "INFO": "ℹ️"}[status]
    RESULTS["details"].append({"status": status, "test": test_name, "detail": detail})
    if status == "PASS":
        RESULTS["passed"] += 1
    elif status == "FAIL":
        RESULTS["failed"] += 1
    elif status == "WARN":
        RESULTS["warnings"] += 1
    print(f"  {icon} {test_name}" + (f" — {detail}" if detail else ""))

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ──────────────────────────────────────────────────────────────
# 1. HEALTH & STATUS
# ──────────────────────────────────────────────────────────────
section("1. HEALTH & STATUS ENDPOINTS")

try:
    r = requests.get(f"{BASE}/status/")
    if r.status_code == 200 and r.json().get("status") == "connected":
        log("PASS", "GET /api/status/ returns 200")
    else:
        log("FAIL", "GET /api/status/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /api/status/", str(e))

# Dashboard now requires authentication — test without auth
try:
    r = requests.get(f"{BASE}/dashboard/")
    if r.status_code == 401:
        log("PASS", "GET /api/dashboard/ requires auth (401)")
    else:
        log("FAIL", "GET /api/dashboard/ should require auth", f"got status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /api/dashboard/", str(e))


# ──────────────────────────────────────────────────────────────
# 2. AUTHENTICATION
# ──────────────────────────────────────────────────────────────
section("2. AUTHENTICATION TESTS")

test_user = f"testuser_{uuid.uuid4().hex[:8]}"
test_email = f"{test_user}@test.com"
test_pass = "TestPass123!"

# 2a. Register
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": test_user,
        "email": test_email,
        "password": test_pass,
        "password_confirm": test_pass,
    })
    if r.status_code == 201:
        reg_data = r.json()
        if "tokens" in reg_data and "user" in reg_data:
            log("PASS", "POST /auth/register/ — user created")
            access_token = reg_data["tokens"]["access"]
            refresh_token = reg_data["tokens"]["refresh"]
        else:
            log("FAIL", "Register response missing tokens/user", json.dumps(reg_data)[:200])
            access_token = None
            refresh_token = None
    else:
        log("FAIL", "POST /auth/register/", f"status={r.status_code} body={r.text[:200]}")
        access_token = None
        refresh_token = None
except Exception as e:
    log("FAIL", "POST /auth/register/", str(e))
    access_token = None
    refresh_token = None

# 2b. Register with duplicate username
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": test_user,
        "email": "other@test.com",
        "password": test_pass,
        "password_confirm": test_pass,
    })
    if r.status_code == 400:
        log("PASS", "Duplicate username rejected (400)")
    else:
        log("FAIL", "Duplicate username NOT rejected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Duplicate username test", str(e))

# 2c. Register with password mismatch
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": "mismatch_user",
        "email": "mismatch@test.com",
        "password": "password1",
        "password_confirm": "password2",
    })
    if r.status_code == 400:
        log("PASS", "Password mismatch rejected (400)")
    else:
        log("FAIL", "Password mismatch NOT rejected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Password mismatch test", str(e))

# 2d. Register with short password
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": "shortpw_user",
        "email": "shortpw@test.com",
        "password": "ab",
        "password_confirm": "ab",
    })
    if r.status_code == 400:
        log("PASS", "Short password rejected (400)")
    else:
        log("FAIL", "Short password NOT rejected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Short password test", str(e))

# 2e. Login with correct credentials
try:
    r = requests.post(f"{BASE}/auth/login/", json={
        "username": test_user,
        "password": test_pass,
    })
    if r.status_code == 200 and "tokens" in r.json():
        log("PASS", "POST /auth/login/ — success")
        access_token = r.json()["tokens"]["access"]
        refresh_token = r.json()["tokens"]["refresh"]
    else:
        log("FAIL", "POST /auth/login/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "POST /auth/login/", str(e))

# 2f. Login with wrong password
try:
    r = requests.post(f"{BASE}/auth/login/", json={
        "username": test_user,
        "password": "WrongPassword!",
    })
    if r.status_code == 401:
        log("PASS", "Wrong password rejected (401)")
    else:
        log("FAIL", "Wrong password NOT rejected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Wrong password test", str(e))

# 2g. Login with email
try:
    r = requests.post(f"{BASE}/auth/login/", json={
        "username": test_email,
        "password": test_pass,
    })
    if r.status_code == 200:
        log("PASS", "Login with email works")
    else:
        log("FAIL", "Login with email", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Login with email", str(e))

# 2h. Profile endpoint
AUTH = {"Authorization": f"Bearer {access_token}"} if access_token else {}
try:
    r = requests.get(f"{BASE}/auth/profile/", headers=AUTH)
    if r.status_code == 200:
        profile = r.json()
        if profile.get("username") == test_user:
            log("PASS", "GET /auth/profile/ — correct user")
        else:
            log("FAIL", "Profile wrong username", f"got {profile.get('username')}")
    else:
        log("FAIL", "GET /auth/profile/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /auth/profile/", str(e))

# 2i. Token refresh
try:
    r = requests.post(f"{BASE}/auth/token/refresh/", json={"refresh": refresh_token})
    if r.status_code == 200 and "access" in r.json():
        log("PASS", "Token refresh works")
        access_token = r.json()["access"]
        AUTH = {"Authorization": f"Bearer {access_token}"}
    else:
        log("FAIL", "Token refresh", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Token refresh", str(e))


# ──────────────────────────────────────────────────────────────
# 3. SECURITY CHECKS
# ──────────────────────────────────────────────────────────────
section("3. SECURITY CHECKS")

# 3a. Protected endpoints without token
protected = [
    ("GET", "/study-materials/"),
    ("GET", "/flashcards/"),
    ("GET", "/study-sessions/"),
    ("GET", "/chat-messages/"),
    ("GET", "/dashboard/"),
    ("POST", "/chat/"),
    ("POST", "/generate-flashcards/"),
    ("POST", "/review-flashcard/"),
    ("GET", "/due-flashcards/"),
    ("GET", "/auth/profile/"),
]

for method, ep in protected:
    try:
        if method == "GET":
            r = requests.get(f"{BASE}{ep}")
        else:
            r = requests.post(f"{BASE}{ep}", json={})
        if r.status_code == 401:
            log("PASS", f"No-auth {method} {ep} → 401")
        elif r.status_code == 403:
            log("PASS", f"No-auth {method} {ep} → 403")
        else:
            log("FAIL", f"No-auth {method} {ep} NOT blocked", f"got {r.status_code}")
    except Exception as e:
        log("FAIL", f"No-auth {method} {ep}", str(e))

# 3b. SQL injection attempt in login
try:
    r = requests.post(f"{BASE}/auth/login/", json={
        "username": "' OR 1=1 --",
        "password": "anything",
    })
    if r.status_code in (400, 401):
        log("PASS", "SQL injection in login blocked")
    else:
        log("WARN", "SQL injection login response unexpected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "SQL injection test", str(e))

# 3c. XSS in registration username
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": "<script>alert('xss')</script>",
        "email": "xss@test.com",
        "password": "TestPass123!",
        "password_confirm": "TestPass123!",
    })
    if r.status_code == 400:
        log("PASS", "XSS in username rejected")
    else:
        # Django's User model may accept this - check if it's escaped in output
        if r.status_code == 201:
            log("WARN", "XSS username accepted — ensure frontend escapes output")
        else:
            log("WARN", "XSS username test", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "XSS test", str(e))

# 3d. CORS headers check
try:
    r = requests.options(f"{BASE}/auth/login/", headers={
        "Origin": "http://evil-site.com",
        "Access-Control-Request-Method": "POST",
    })
    cors = r.headers.get("Access-Control-Allow-Origin", "")
    if cors == "*":
        log("WARN", "CORS allows ALL origins (*)", "Restrict in production!")
    elif "evil-site" in cors:
        log("WARN", "CORS allows evil origin")
    else:
        log("PASS", "CORS not wide-open")
except Exception as e:
    log("WARN", "CORS check", str(e))

# 3e. JWT token in response shouldn't expose sensitive data
try:
    r = requests.post(f"{BASE}/auth/login/", json={
        "username": test_user,
        "password": test_pass,
    })
    data = r.json()
    user_data = data.get("user", {})
    if "password" in user_data or "password_hash" in user_data:
        log("FAIL", "Password exposed in login response!")
    else:
        log("PASS", "No password in login response")
except Exception as e:
    log("FAIL", "Password exposure check", str(e))


# ──────────────────────────────────────────────────────────────
# 4. STUDY MATERIALS CRUD
# ──────────────────────────────────────────────────────────────
section("4. STUDY MATERIALS CRUD")

# 4a. Create
try:
    r = requests.post(f"{BASE}/study-materials/", headers=AUTH, json={
        "title": "Test Material",
        "description": "A test material for API testing",
        "content": "This is some study content about physics and quantum mechanics.",
        "material_type": "note",
    })
    if r.status_code == 201:
        material = r.json()
        material_id = material["id"]
        log("PASS", "POST /study-materials/ — created")
        if material.get("owner") is not None:
            log("PASS", "Material has owner field set")
        else:
            log("WARN", "Material owner is null")
    else:
        log("FAIL", "POST /study-materials/", f"status={r.status_code} body={r.text[:200]}")
        material_id = None
except Exception as e:
    log("FAIL", "POST /study-materials/", str(e))
    material_id = None

# 4b. List
try:
    r = requests.get(f"{BASE}/study-materials/", headers=AUTH)
    if r.status_code == 200:
        data = r.json()
        # DRF pagination should have 'results' key
        if "results" in data:
            log("PASS", "GET /study-materials/ — paginated response")
        elif isinstance(data, list):
            log("WARN", "GET /study-materials/ — NOT paginated (returns raw list)")
        else:
            log("WARN", "GET /study-materials/ — unexpected format")
    else:
        log("FAIL", "GET /study-materials/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /study-materials/", str(e))

# 4c. Get single
if material_id:
    try:
        r = requests.get(f"{BASE}/study-materials/{material_id}/", headers=AUTH)
        if r.status_code == 200:
            log("PASS", "GET /study-materials/:id/ — found")
        else:
            log("FAIL", "GET /study-materials/:id/", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "GET /study-materials/:id/", str(e))

# 4d. Update
if material_id:
    try:
        r = requests.patch(f"{BASE}/study-materials/{material_id}/", headers=AUTH, json={
            "title": "Updated Material Title"
        })
        if r.status_code == 200:
            log("PASS", "PATCH /study-materials/:id/ — updated")
        else:
            log("FAIL", "PATCH /study-materials/:id/", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "PATCH /study-materials/:id/", str(e))


# ──────────────────────────────────────────────────────────────
# 5. FLASHCARDS CRUD
# ──────────────────────────────────────────────────────────────
section("5. FLASHCARDS CRUD")

# 5a. Create
try:
    r = requests.post(f"{BASE}/flashcards/", headers=AUTH, json={
        "question": "What is Newton's first law?",
        "answer": "An object at rest stays at rest unless acted upon by an external force.",
        "difficulty": "medium",
        "study_material": material_id,
    })
    if r.status_code == 201:
        flashcard = r.json()
        flashcard_id = flashcard["id"]
        log("PASS", "POST /flashcards/ — created")
        # Check SRS fields present
        srs_fields = ["easiness_factor", "interval_days", "repetitions", "next_review_date"]
        missing = [f for f in srs_fields if f not in flashcard]
        if not missing:
            log("PASS", "Flashcard has all SRS fields")
        else:
            log("FAIL", "Flashcard missing SRS fields", str(missing))
    else:
        log("FAIL", "POST /flashcards/", f"status={r.status_code} body={r.text[:200]}")
        flashcard_id = None
except Exception as e:
    log("FAIL", "POST /flashcards/", str(e))
    flashcard_id = None

# 5b. List with filter
try:
    r = requests.get(f"{BASE}/flashcards/?difficulty=medium", headers=AUTH)
    if r.status_code == 200:
        log("PASS", "GET /flashcards/?difficulty=medium — filter works")
    else:
        log("FAIL", "GET /flashcards/ with filter", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /flashcards/ filter", str(e))

# 5c. Update
if flashcard_id:
    try:
        r = requests.patch(f"{BASE}/flashcards/{flashcard_id}/", headers=AUTH, json={
            "difficulty": "hard"
        })
        if r.status_code == 200:
            log("PASS", "PATCH /flashcards/:id/ — updated")
        else:
            log("FAIL", "PATCH /flashcards/:id/", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "PATCH /flashcards/:id/", str(e))


# ──────────────────────────────────────────────────────────────
# 6. SPACED REPETITION
# ──────────────────────────────────────────────────────────────
section("6. SPACED REPETITION (SM-2)")

# 6a. Due flashcards
try:
    r = requests.get(f"{BASE}/due-flashcards/", headers=AUTH)
    if r.status_code == 200:
        data = r.json()
        if "count" in data and "results" in data:
            log("PASS", "GET /due-flashcards/ — returns count + results")
        else:
            log("FAIL", "GET /due-flashcards/ missing keys", str(data.keys()))
    else:
        log("FAIL", "GET /due-flashcards/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /due-flashcards/", str(e))

# 6b. Review flashcard
if flashcard_id:
    try:
        r = requests.post(f"{BASE}/review-flashcard/", headers=AUTH, json={
            "flashcard_id": flashcard_id,
            "quality": 4,
        })
        if r.status_code == 200:
            result = r.json()
            if "next_review_date" in result and "interval_days" in result:
                log("PASS", f"POST /review-flashcard/ — next review in {result['interval_days']} days")
            else:
                log("FAIL", "Review response missing fields")
        else:
            log("FAIL", "POST /review-flashcard/", f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("FAIL", "POST /review-flashcard/", str(e))

    # 6c. Review with invalid quality
    try:
        r = requests.post(f"{BASE}/review-flashcard/", headers=AUTH, json={
            "flashcard_id": flashcard_id,
            "quality": 10,  # Invalid
        })
        if r.status_code == 400:
            log("PASS", "Invalid quality (10) rejected")
        else:
            log("FAIL", "Invalid quality NOT rejected", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "Invalid quality test", str(e))

    # 6d. Review without flashcard_id
    try:
        r = requests.post(f"{BASE}/review-flashcard/", headers=AUTH, json={
            "quality": 3,
        })
        if r.status_code == 400:
            log("PASS", "Missing flashcard_id rejected (400)")
        else:
            log("FAIL", "Missing flashcard_id NOT rejected", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "Missing flashcard_id test", str(e))

    # 6e. Review with non-numeric quality (regression test for ValueError crash)
    try:
        r = requests.post(f"{BASE}/review-flashcard/", headers=AUTH, json={
            "flashcard_id": flashcard_id,
            "quality": "abc",
        })
        if r.status_code == 400:
            log("PASS", "Non-numeric quality 'abc' rejected (400)")
        elif r.status_code == 500:
            log("FAIL", "Non-numeric quality crashed server (500)!", "ValueError not caught")
        else:
            log("FAIL", "Non-numeric quality test", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "Non-numeric quality test", str(e))


# ──────────────────────────────────────────────────────────────
# 7. STUDY SESSIONS CRUD
# ──────────────────────────────────────────────────────────────
section("7. STUDY SESSIONS CRUD")

try:
    r = requests.post(f"{BASE}/study-sessions/", headers=AUTH, json={
        "title": "Test Session",
        "duration_minutes": 45,
        "notes": "Studied quantum mechanics chapter 3",
        "date": "2026-05-31",
    })
    if r.status_code == 201:
        session = r.json()
        session_id = session["id"]
        log("PASS", "POST /study-sessions/ — created")
    else:
        log("FAIL", "POST /study-sessions/", f"status={r.status_code} body={r.text[:200]}")
        session_id = None
except Exception as e:
    log("FAIL", "POST /study-sessions/", str(e))
    session_id = None

try:
    r = requests.get(f"{BASE}/study-sessions/", headers=AUTH)
    if r.status_code == 200:
        log("PASS", "GET /study-sessions/ — listed")
    else:
        log("FAIL", "GET /study-sessions/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /study-sessions/", str(e))


# ──────────────────────────────────────────────────────────────
# 8. AI CHAT
# ──────────────────────────────────────────────────────────────
section("8. AI CHAT ENDPOINT")

try:
    r = requests.post(f"{BASE}/chat/", headers=AUTH, json={
        "message": "What is the capital of France?",
    })
    if r.status_code == 200:
        chat = r.json()
        if "session_id" in chat and "ai_response" in chat:
            log("PASS", "POST /chat/ — got AI response")
            # Check if it's a real AI response or fallback
            if "GEMINI_API_KEY" in chat.get("ai_response", ""):
                log("WARN", "AI chat using FALLBACK (no Gemini key)", "Add GEMINI_API_KEY to .env")
            else:
                log("PASS", "AI chat using real Gemini")
            chat_session_id = chat["session_id"]
        else:
            log("FAIL", "Chat response missing fields", str(chat.keys()))
            chat_session_id = None
    else:
        log("FAIL", "POST /chat/", f"status={r.status_code} body={r.text[:200]}")
        chat_session_id = None
except Exception as e:
    log("FAIL", "POST /chat/", str(e))
    chat_session_id = None

# 8b. Empty message
try:
    r = requests.post(f"{BASE}/chat/", headers=AUTH, json={"message": ""})
    if r.status_code == 400:
        log("PASS", "Empty chat message rejected (400)")
    else:
        log("FAIL", "Empty chat message NOT rejected", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "Empty chat test", str(e))

# 8c. Chat messages retrieval
try:
    r = requests.get(f"{BASE}/chat-messages/", headers=AUTH)
    if r.status_code == 200:
        log("PASS", "GET /chat-messages/ — listed")
    else:
        log("FAIL", "GET /chat-messages/", f"status={r.status_code}")
except Exception as e:
    log("FAIL", "GET /chat-messages/", str(e))

# 8d. Filter by session_id
if chat_session_id:
    try:
        r = requests.get(f"{BASE}/chat-messages/?session_id={chat_session_id}", headers=AUTH)
        if r.status_code == 200:
            log("PASS", "GET /chat-messages/?session_id= — filtered")
        else:
            log("FAIL", "Chat messages filter", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "Chat messages filter", str(e))


# ──────────────────────────────────────────────────────────────
# 9. DATA ISOLATION (MULTI-USER SECURITY)
# ──────────────────────────────────────────────────────────────
section("9. DATA ISOLATION (MULTI-USER)")

# Create a second user
user2 = f"testuser2_{uuid.uuid4().hex[:8]}"
try:
    r = requests.post(f"{BASE}/auth/register/", json={
        "username": user2,
        "email": f"{user2}@test.com",
        "password": "TestPass456!",
        "password_confirm": "TestPass456!",
    })
    if r.status_code == 201:
        auth2 = {"Authorization": f"Bearer {r.json()['tokens']['access']}"}
        log("PASS", "Second user registered")
    else:
        auth2 = None
        log("FAIL", "Second user register", f"status={r.status_code}")
except Exception as e:
    auth2 = None
    log("FAIL", "Second user register", str(e))

# User 2 should NOT see User 1's materials
if auth2:
    try:
        r = requests.get(f"{BASE}/study-materials/", headers=auth2)
        if r.status_code == 200:
            data = r.json()
            results = data.get("results", data) if isinstance(data, dict) else data
            if len(results) == 0:
                log("PASS", "User 2 sees 0 materials (isolation works)")
            else:
                log("FAIL", "User 2 sees other user's materials!", f"count={len(results)}")
        else:
            log("FAIL", "User 2 list materials", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "User 2 list materials", str(e))

    # User 2 should NOT access User 1's material by ID
    if material_id:
        try:
            r = requests.get(f"{BASE}/study-materials/{material_id}/", headers=auth2)
            if r.status_code == 404:
                log("PASS", "User 2 cannot access User 1's material (404)")
            elif r.status_code == 403:
                log("PASS", "User 2 cannot access User 1's material (403)")
            else:
                log("FAIL", "User 2 CAN access User 1's material!", f"status={r.status_code}")
        except Exception as e:
            log("FAIL", "Cross-user material access", str(e))

    # User 2 should NOT see User 1's flashcards
    try:
        r = requests.get(f"{BASE}/flashcards/", headers=auth2)
        if r.status_code == 200:
            data = r.json()
            results = data.get("results", data) if isinstance(data, dict) else data
            if len(results) == 0:
                log("PASS", "User 2 sees 0 flashcards (isolation works)")
            else:
                log("FAIL", "User 2 sees other user's flashcards!", f"count={len(results)}")
        else:
            log("FAIL", "User 2 list flashcards", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "User 2 list flashcards", str(e))


# ──────────────────────────────────────────────────────────────
# 10. CLEANUP — DELETE RESOURCES
# ──────────────────────────────────────────────────────────────
section("10. CLEANUP & DELETE TESTS")

if flashcard_id:
    try:
        r = requests.delete(f"{BASE}/flashcards/{flashcard_id}/", headers=AUTH)
        if r.status_code == 204:
            log("PASS", "DELETE /flashcards/:id/ — deleted")
        else:
            log("FAIL", "DELETE flashcard", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "DELETE flashcard", str(e))

if session_id:
    try:
        r = requests.delete(f"{BASE}/study-sessions/{session_id}/", headers=AUTH)
        if r.status_code == 204:
            log("PASS", "DELETE /study-sessions/:id/ — deleted")
        else:
            log("FAIL", "DELETE session", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "DELETE session", str(e))

if material_id:
    try:
        r = requests.delete(f"{BASE}/study-materials/{material_id}/", headers=AUTH)
        if r.status_code == 204:
            log("PASS", "DELETE /study-materials/:id/ — deleted")
        else:
            log("FAIL", "DELETE material", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "DELETE material", str(e))

# Verify deletion
if material_id:
    try:
        r = requests.get(f"{BASE}/study-materials/{material_id}/", headers=AUTH)
        if r.status_code == 404:
            log("PASS", "Deleted material returns 404")
        else:
            log("FAIL", "Deleted material still accessible!", f"status={r.status_code}")
    except Exception as e:
        log("FAIL", "Verify deletion", str(e))


# ──────────────────────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────────────────────
section("TEST SUMMARY")
print(f"\n  ✅ Passed:   {RESULTS['passed']}")
print(f"  ❌ Failed:   {RESULTS['failed']}")
print(f"  ⚠️  Warnings: {RESULTS['warnings']}")
print(f"  📊 Total:    {RESULTS['passed'] + RESULTS['failed'] + RESULTS['warnings']}")

if RESULTS['failed'] > 0:
    print(f"\n  FAILURES:")
    for d in RESULTS['details']:
        if d['status'] == 'FAIL':
            print(f"    ❌ {d['test']}: {d['detail']}")

if RESULTS['warnings'] > 0:
    print(f"\n  WARNINGS:")
    for d in RESULTS['details']:
        if d['status'] == 'WARN':
            print(f"    ⚠️  {d['test']}: {d['detail']}")

print()
sys.exit(1 if RESULTS['failed'] > 0 else 0)
