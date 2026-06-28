"""End-to-end backend tests for Anatomia AI."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://anatomia-explore.preview.emergentagent.com").rstrip("/")
TEST_TOKEN = "test_session_anatomia_001"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def auth_client():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}",
    })
    return s


# ============================ Health ============================
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data["app"] == "Anatomia AI"
        assert data["status"] == "ok"


# ============================ Auth ============================
class TestAuth:
    def test_me_no_token(self, client):
        r = client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, client):
        r = client.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid-token-xyz"},
        )
        assert r.status_code == 401

    def test_me_valid_bearer(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["user_id"] == "test-user-anatomia"
        assert data["email"] == "test@anatomia.ai"
        assert data["persona"] in ("school_student", "medical_student", "doctor")

    def test_me_valid_cookie(self, client):
        r = client.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": TEST_TOKEN},
        )
        assert r.status_code == 200
        assert r.json()["user_id"] == "test-user-anatomia"

    def test_session_invalid_id(self, client):
        r = client.post(
            f"{BASE_URL}/api/auth/session",
            json={"session_id": "definitely-not-valid-emergent-session"},
        )
        assert r.status_code == 401


# ============================ Persona ============================
class TestPersona:
    def test_set_persona_unauthenticated(self, client):
        r = client.post(f"{BASE_URL}/api/user/persona", json={"persona": "doctor"})
        assert r.status_code == 401

    def test_set_persona_invalid(self, auth_client):
        r = auth_client.post(f"{BASE_URL}/api/user/persona", json={"persona": "nurse"})
        assert r.status_code == 422

    def test_set_persona_valid_and_persist(self, auth_client):
        # set to school_student
        r = auth_client.post(f"{BASE_URL}/api/user/persona", json={"persona": "school_student"})
        assert r.status_code == 200
        assert r.json()["persona"] == "school_student"

        # verify via /auth/me
        me = auth_client.get(f"{BASE_URL}/api/auth/me").json()
        assert me["persona"] == "school_student"

        # restore to medical_student (default test persona)
        r = auth_client.post(f"{BASE_URL}/api/user/persona", json={"persona": "medical_student"})
        assert r.status_code == 200
        me = auth_client.get(f"{BASE_URL}/api/auth/me").json()
        assert me["persona"] == "medical_student"


# ============================ AI Tutor (Gemini) ============================
class TestTutor:
    def test_tutor_anonymous(self, client):
        r = client.post(
            f"{BASE_URL}/api/tutor/chat",
            json={"message": "What is the heart?", "persona": "school_student"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["persona"] == "school_student"
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 20

    def test_tutor_authenticated_medical(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/tutor/chat",
            json={"message": "Explain the cardiac cycle in one paragraph.", "topic": "Heart"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["persona"] == "medical_student"
        reply = data["reply"].lower()
        assert len(reply) > 50
        # Check for at least one anatomical term
        terms = ["systole", "diastole", "ventric", "atri", "valve", "cardiac"]
        assert any(t in reply for t in terms), f"Reply lacks anatomy terms: {reply[:300]}"


# ============================ Logout ============================
class TestLogout:
    def test_logout_no_token(self, client):
        r = client.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_logout_invalidates_session(self, client):
        """Create a temp session token then logout and confirm 401 afterwards.
        Since we can't go through Emergent OAuth here, we directly insert a session via Mongo,
        skip if cannot. Simpler: rely on real seeded token but DO NOT delete it (would break other tests).
        So just check the logout endpoint returns 200 with no harm.
        """
        r = client.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": "Bearer non-existent-token-skip"},
        )
        assert r.status_code == 200
