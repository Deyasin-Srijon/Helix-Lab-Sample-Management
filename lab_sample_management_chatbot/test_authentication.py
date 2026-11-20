import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.auth.authentication import authenticate_chat_request


class AuthenticationTests(unittest.IsolatedAsyncioTestCase):

    # Test 1: Valid user session should produce USER context.
    async def test_valid_user_session(self):

        with patch(
            "app.auth.authentication.verify_admin_session",
            return_value=None
        ), patch(
            "app.auth.authentication.verify_user_session",
            return_value={
                "userId": 5,
                "username": "testuser"
            }
        ):

            auth = await authenticate_chat_request(
                user_cookie="fake-user-cookie",
                admin_cookie=None
            )

            self.assertEqual(auth.role, "USER")
            self.assertEqual(auth.user_id, 5)
            self.assertEqual(auth.username, "testuser")
            self.assertEqual(auth.cookie_name, "JSESSIONID")

            print("PASS: Valid USER session")


    # Test 2: Valid admin session should produce ADMIN context.
    async def test_valid_admin_session(self):

        with patch(
            "app.auth.authentication.verify_admin_session",
            return_value={
                "adminId": 1,
                "username": "Admin"
            }
        ), patch(
            "app.auth.authentication.verify_user_session"
        ) as user_verification:

            auth = await authenticate_chat_request(
                user_cookie=None,
                admin_cookie="fake-admin-cookie"
            )

            self.assertEqual(auth.role, "ADMIN")
            self.assertEqual(auth.user_id, 1)
            self.assertEqual(auth.username, "Admin")
            self.assertEqual(auth.cookie_name, "ADMINSESSIONID")

            # Admin authentication should not need user verification.
            user_verification.assert_not_called()

            print("PASS: Valid ADMIN session")


    # Test 3: Invalid sessions should be rejected.
    async def test_invalid_sessions(self):

        with patch(
            "app.auth.authentication.verify_admin_session",
            return_value=None
        ), patch(
            "app.auth.authentication.verify_user_session",
            return_value=None
        ):

            with self.assertRaises(HTTPException) as error:

                await authenticate_chat_request(
                    user_cookie="invalid-user-cookie",
                    admin_cookie="invalid-admin-cookie"
                )

            self.assertEqual(error.exception.status_code, 401)

            print("PASS: Invalid sessions rejected with 401")


    # Test 4: If both sessions are valid, ADMIN takes precedence.
    async def test_admin_precedence_when_both_sessions_valid(self):

        with patch(
            "app.auth.authentication.verify_admin_session",
            return_value={
                "adminId": 1,
                "username": "Admin"
            }
        ), patch(
            "app.auth.authentication.verify_user_session"
        ) as user_verification:

            auth = await authenticate_chat_request(
                user_cookie="fake-user-cookie",
                admin_cookie="fake-admin-cookie"
            )

            self.assertEqual(auth.role, "ADMIN")

            # The user session should not be checked after valid admin.
            user_verification.assert_not_called()

            print("PASS: ADMIN takes precedence when both sessions exist")


if __name__ == "__main__":
    unittest.main(verbosity=2)
