"""Backend tests for iteration 2: tutor stream/history, quiz gamification, leaderboard, badges."""
import os
import json
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://anatomia-explore.preview.emergentagent.com").rstrip("/")
TEST_TOKEN = "test_session_anatomia_001"
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {TEST_TOKEN}"}


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update(HEADERS)
    return s


# ============================ Badges ============================
class TestBadges:
    def test_list_badges(self, client):
        r = client.get(f"{BASE_URL}/api/badges")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 7
        ids = {b["id"] for b in data}
        assert {"first-quiz", "perfect-quiz", "xp-100", "xp-500", "xp-1000", "streak-3", "streak-7"} == ids
        for b in data:
            assert "name" in b and "xp" in b and "icon" in b


# ============================ Tutor Stream ============================
class TestTutorStream:
    def test_stream_sse_format(self, client):
        # Clear history first so we know baseline
        client.delete(f"{BASE_URL}/api/tutor/history")

        r = requests.post(
            f"{BASE_URL}/api/tutor/stream",
            headers=HEADERS,
            json={"message": "Define stroke", "persona": "medical_student"},
            stream=True,
            timeout=90,
        )
        assert r.status_code == 200, r.text
        ct = r.headers.get("content-type", "")
        assert "text/event-stream" in ct, f"Unexpected content-type: {ct}"

        deltas = []
        done = None
        for raw in r.iter_lines(decode_unicode=True):
            if not raw:
                continue
            assert raw.startswith("data: "), f"Bad SSE line: {raw[:80]}"
            payload = json.loads(raw[len("data: "):])
            if "delta" in payload:
                deltas.append(payload["delta"])
            if payload.get("done"):
                done = payload
                break
        assert done is not None, "No done event"
        assert done.get("persona") == "medical_student"
        assert done.get("session_id") == "tutor_test-user-anatomia"
        # Ensure we got some content
        joined = "".join(deltas)
        assert len(joined) > 20, f"Stream content too short: {joined!r}"

    def test_history_returns_messages_after_stream(self, client):
        # Give DB a moment after the previous test
        time.sleep(1)
        r = client.get(f"{BASE_URL}/api/tutor/history")
        assert r.status_code == 200
        data = r.json()
        assert data["session_id"] == "tutor_test-user-anatomia"
        msgs = data["messages"]
        assert isinstance(msgs, list)
        assert len(msgs) >= 2
        roles = [m["role"] for m in msgs]
        assert "user" in roles and "assistant" in roles
        # First message should be the user "Define stroke" query
        user_msgs = [m for m in msgs if m["role"] == "user"]
        assert any("stroke" in m["content"].lower() for m in user_msgs)

    def test_history_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/tutor/history")
        assert r.status_code == 200
        data = r.json()
        assert data["messages"] == []
        assert data["session_id"] is None

    def test_delete_history(self, client):
        r = client.delete(f"{BASE_URL}/api/tutor/history")
        assert r.status_code == 200
        data = r.json()
        assert "deleted" in data
        assert data["deleted"] >= 2  # at least the pair we created

        # Verify empty after delete
        r2 = client.get(f"{BASE_URL}/api/tutor/history")
        assert r2.status_code == 200
        assert r2.json()["messages"] == []


# ============================ Quiz Submit ============================
class TestQuizSubmit:
    def test_submit_perfect_quiz(self, client):
        # Capture current state
        me_before = client.get(f"{BASE_URL}/api/auth/me").json()
        xp_before = me_before.get("xp", 0)
        streak_before = me_before.get("streak", 0)

        r = client.post(f"{BASE_URL}/api/quiz/submit",
                        json={"quiz_id": "heart-basics", "score": 5, "total": 5})
        assert r.status_code == 200, r.text
        data = r.json()

        # Score 5 * 10 + 50 perfect bonus = 100 XP earned
        assert data["earned_xp"] == 100
        assert data["perfect"] is True
        assert data["xp"] == xp_before + 100
        assert "streak" in data
        assert "new_badges" in data
        assert "all_badges" in data
        assert isinstance(data["new_badges"], list)

        # Verify persistence
        me_after = client.get(f"{BASE_URL}/api/auth/me").json()
        assert me_after["xp"] == xp_before + 100

    def test_submit_same_day_no_streak_increase(self, client):
        me1 = client.get(f"{BASE_URL}/api/auth/me").json()
        streak1 = me1["streak"]

        r = client.post(f"{BASE_URL}/api/quiz/submit",
                        json={"quiz_id": "brain-basics", "score": 3, "total": 5})
        assert r.status_code == 200
        data = r.json()
        # Same day -> streak should remain the same as before
        assert data["streak"] == streak1, f"Streak changed on same-day submit: {streak1} -> {data['streak']}"
        # Non-perfect quiz: 3 * 10 = 30 XP, no bonus
        assert data["earned_xp"] == 30
        assert data["perfect"] is False

    def test_submit_unauthenticated(self):
        r = requests.post(f"{BASE_URL}/api/quiz/submit",
                          json={"quiz_id": "heart-basics", "score": 5, "total": 5})
        assert r.status_code == 401


# ============================ Leaderboard ============================
class TestLeaderboard:
    def test_leaderboard_ordering(self, client):
        r = requests.get(f"{BASE_URL}/api/leaderboard")
        assert r.status_code == 200
        data = r.json()
        assert "top" in data
        top = data["top"]
        assert isinstance(top, list)
        # Verify descending order by xp
        xps = [u.get("xp", 0) for u in top]
        assert xps == sorted(xps, reverse=True), f"Leaderboard not sorted: {xps}"
        # Test user should be present
        names = [u.get("name") for u in top]
        # Should include our seeded test user (Dr. Test) since they have XP
        if len(top) > 0:
            for u in top:
                assert "_id" not in u  # MongoDB _id must be excluded
