"""
Authentication isolation tests.

Core rule under test: the session that belongs to THIS request decides
the identity. A valid session of the other role must never substitute.
"""

import asyncio
import unittest
from unittest.mock import patch, AsyncMock

import httpx
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.auth.authentication import authenticate_chat_request

ADMIN_OK = {"adminId": 1, "username": "Admin"}
USER_OK = {"userId": 5, "username": "alice"}


def patched(admin=None, user=None):
    """Patch both Spring verifiers with fixed async results."""
    return (
        patch("app.auth.authentication.verify_admin_session",
              new=AsyncMock(return_value=admin)),
        patch("app.auth.authentication.verify_user_session",
              new=AsyncMock(return_value=user)),
    )


class AuthenticationTests(unittest.IsolatedAsyncioTestCase):

    # ---------- happy paths ----------

    async def test_valid_user_session(self):
        a, u = patched(user=USER_OK)
        with a, u:
            auth = await authenticate_chat_request("uc", None)
        self.assertEqual((auth.role, auth.user_id, auth.cookie_name),
                         ("USER", 5, "JSESSIONID"))

    async def test_valid_admin_session(self):
        a, u = patched(admin=ADMIN_OK)
        with a as av, u as uv:
            auth = await authenticate_chat_request(None, "ac")
        self.assertEqual((auth.role, auth.user_id, auth.cookie_name),
                         ("ADMIN", 1, "ADMINSESSIONID"))
        uv.assert_not_called()

    # ---------- THE BUG: both cookies present ----------

    async def test_user_portal_with_both_valid_is_user_not_admin(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a as av, u:
            auth = await authenticate_chat_request("uc", "ac", portal="USER")
        self.assertEqual(auth.role, "USER")
        self.assertEqual(auth.session_cookie, "uc")
        av.assert_not_called()          # admin session never even consulted

    async def test_admin_portal_with_both_valid_is_admin_not_user(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a, u as uv:
            auth = await authenticate_chat_request("uc", "ac", portal="ADMIN")
        self.assertEqual(auth.role, "ADMIN")
        self.assertEqual(auth.session_cookie, "ac")
        uv.assert_not_called()

    # ---------- expired session must never fall back ----------

    async def test_user_session_expired_admin_alive_is_401(self):
        a, u = patched(admin=ADMIN_OK, user=None)
        with a as av, u:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", "ac", portal="USER")
        self.assertEqual(e.exception.status_code, 401)
        av.assert_not_called()

    async def test_admin_session_expired_user_alive_is_401(self):
        a, u = patched(admin=None, user=USER_OK)
        with a, u as uv:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", "ac", portal="ADMIN")
        self.assertEqual(e.exception.status_code, 401)
        uv.assert_not_called()

    # ---------- missing / garbage ----------

    async def test_no_cookies_is_401(self):
        a, u = patched()
        with a, u:
            for portal in (None, "USER", "ADMIN"):
                with self.assertRaises(HTTPException) as e:
                    await authenticate_chat_request(None, None, portal=portal)
                self.assertEqual(e.exception.status_code, 401)

    async def test_portal_without_its_own_cookie_is_401_even_if_other_valid(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a as av, u as uv:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request(None, "ac", portal="USER")
            self.assertEqual(e.exception.status_code, 401)
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", None, portal="ADMIN")
            self.assertEqual(e.exception.status_code, 401)
        av.assert_not_called()
        uv.assert_not_called()

    async def test_invalid_tokens_rejected(self):
        a, u = patched(admin=None, user=None)
        with a, u:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("bad", "bad", portal="USER")
        self.assertEqual(e.exception.status_code, 401)

    # ---------- ambiguity & bad input ----------

    async def test_both_cookies_without_portal_is_rejected_not_guessed(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a as av, u as uv:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", "ac")
        self.assertEqual(e.exception.status_code, 400)
        av.assert_not_called()
        uv.assert_not_called()

    async def test_unknown_portal_value_rejected(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a, u:
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", "ac", portal="root")
        self.assertEqual(e.exception.status_code, 400)

    async def test_portal_is_case_insensitive(self):
        a, u = patched(user=USER_OK)
        with a, u:
            auth = await authenticate_chat_request("uc", "ac", portal=" user ")
        self.assertEqual(auth.role, "USER")

    # ---------- backend outage != invalid session ----------

    async def test_backend_unreachable_is_503_for_both_roles(self):
        err = AsyncMock(side_effect=httpx.ConnectError("down"))
        with patch("app.auth.authentication.verify_user_session", new=err):
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request("uc", None, portal="USER")
        self.assertEqual(e.exception.status_code, 503)
        with patch("app.auth.authentication.verify_admin_session", new=err):
            with self.assertRaises(HTTPException) as e:
                await authenticate_chat_request(None, "ac", portal="ADMIN")
        self.assertEqual(e.exception.status_code, 503)

    # ---------- concurrency isolation ----------

    async def test_concurrent_requests_stay_isolated(self):
        async def fake_user(cookie):
            await asyncio.sleep(0.01)
            return {"userId": int(cookie.split("-")[1]), "username": cookie}

        async def fake_admin(cookie):
            await asyncio.sleep(0.005)
            return ADMIN_OK if cookie == "ac" else None

        with patch("app.auth.authentication.verify_user_session", new=fake_user), \
             patch("app.auth.authentication.verify_admin_session", new=fake_admin):
            jobs = [
                authenticate_chat_request("u-1", "ac", portal="USER"),
                authenticate_chat_request("u-2", "ac", portal="USER"),
                authenticate_chat_request("u-3", None, portal="USER"),
                authenticate_chat_request("u-9", "ac", portal="ADMIN"),
                authenticate_chat_request("u-4", "ac", portal="USER"),
            ]
            res = await asyncio.gather(*jobs)

        self.assertEqual([r.role for r in res],
                         ["USER", "USER", "USER", "ADMIN", "USER"])
        self.assertEqual([r.user_id for r in res], [1, 2, 3, 1, 4])
        self.assertEqual([r.session_cookie for r in res],
                         ["u-1", "u-2", "u-3", "ac", "u-4"])


class ChatEndpointTests(unittest.TestCase):
    """Through the real /api/chat route (Groq/MCP mocked out)."""

    def setUp(self):
        from app.main import app
        self.client = TestClient(app)
        self.seen = []

        async def fake_process(user_message, auth_context):
            self.seen.append(auth_context.role)
            return f"role={auth_context.role}"

        self.p = patch("app.main.process_chat_with_tools", new=fake_process)
        self.p.start()

    def tearDown(self):
        self.p.stop()

    def _post(self, cookies, portal=None):
        headers = {"X-Chat-Portal": portal} if portal else {}
        return self.client.post("/api/chat", json={"message": "hi"},
                                cookies=cookies, headers=headers)

    def test_user_with_stale_admin_cookie_gets_user_context(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a, u:
            r = self._post({"JSESSIONID": "uc", "ADMINSESSIONID": "ac"}, "USER")
        self.assertEqual((r.status_code, r.json()["reply"]), (200, "role=USER"))

    def test_user_session_dead_admin_alive_returns_401_and_never_reaches_chat(self):
        a, u = patched(admin=ADMIN_OK, user=None)
        with a, u:
            r = self._post({"JSESSIONID": "dead", "ADMINSESSIONID": "ac"}, "USER")
        self.assertEqual(r.status_code, 401)
        self.assertEqual(self.seen, [])

    def test_admin_session_dead_user_alive_returns_401(self):
        a, u = patched(admin=None, user=USER_OK)
        with a, u:
            r = self._post({"JSESSIONID": "uc", "ADMINSESSIONID": "dead"}, "ADMIN")
        self.assertEqual(r.status_code, 401)
        self.assertEqual(self.seen, [])

    def test_missing_cookies_401(self):
        a, u = patched()
        with a, u:
            r = self._post({}, "USER")
        self.assertEqual(r.status_code, 401)

    def test_admin_only_browser_without_header_still_works(self):
        a, u = patched(admin=ADMIN_OK)
        with a, u:
            r = self._post({"ADMINSESSIONID": "ac"})
        self.assertEqual((r.status_code, r.json()["reply"]), (200, "role=ADMIN"))

    def test_user_only_browser_without_header_still_works(self):
        a, u = patched(user=USER_OK)
        with a, u:
            r = self._post({"JSESSIONID": "uc"})
        self.assertEqual((r.status_code, r.json()["reply"]), (200, "role=USER"))

    def test_both_cookies_no_header_rejected_400(self):
        a, u = patched(admin=ADMIN_OK, user=USER_OK)
        with a, u:
            r = self._post({"JSESSIONID": "uc", "ADMINSESSIONID": "ac"})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(self.seen, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)