"""
Chat-level role behaviour with Groq and MCP mocked.
Confirms that once auth resolves the right role, USER creation works
and ADMIN creation stays blocked.
"""
import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch, AsyncMock

from app.auth.auth_context import AuthContext
from app.services import tool_call_service as svc

ADMIN_MSG = ("Sample creation is not available for the Admin role. "
             "This service is intended for authorized User accounts.")


def mcp_tool(name):
    return SimpleNamespace(
        name=name, description=name,
        input_schema={"type": "object", "properties": {
            "description": {"type": "string"}, "sessionId": {"type": "string"}},
            "required": ["sessionId"]})


ALL_TOOLS = [mcp_tool(n) for n in [
    "create_sample", "get_my_samples", "get_my_sample_by_id",
    "update_my_sample", "delete_my_sample", "get_all_samples",
    "get_sample_by_id", "update_sample", "delete_sample",
    "filter_samples_by_status", "filter_samples_by_user"]]


def ctx(role):
    return AuthContext(role=role, user_id=1, username="x",
                       session_cookie="secret-cookie",
                       cookie_name="JSESSIONID" if role == "USER" else "ADMINSESSIONID")


def groq_reply(text=None, tool_calls=None):
    msg = SimpleNamespace(content=text, tool_calls=tool_calls,
                          model_dump=lambda exclude_none=True: {
                              "role": "assistant", "content": text or ""})
    return SimpleNamespace(choices=[SimpleNamespace(message=msg)])


class ChatRoleTests(unittest.IsolatedAsyncioTestCase):

    def _patches(self, create_mock):
        return (
            patch.object(svc, "discover_mcp_tools",
                         new=AsyncMock(return_value=ALL_TOOLS)),
            patch.object(svc.groq_client.chat.completions, "create", new=create_mock),
        )

    async def test_user_register_question_reaches_groq_with_create_tool(self):
        create = AsyncMock(return_value=groq_reply("Provide a description."))
        d, g = self._patches(create)
        with d, g:
            out = await svc.process_chat_with_tools(
                "How can I register a new sample?", ctx("USER"))
        self.assertEqual(out, "Provide a description.")
        names = {t["function"]["name"] for t in create.call_args.kwargs["tools"]}
        self.assertIn("create_sample", names)
        self.assertNotIn("get_all_samples", names)
        sysmsg = create.call_args.kwargs["messages"][0]["content"]
        self.assertIn("AUTHENTICATED ROLE: USER", sysmsg)
        # sessionId must never be offered to the model
        for t in create.call_args.kwargs["tools"]:
            self.assertNotIn("sessionId", t["function"]["parameters"]["properties"])

    async def test_user_create_calls_tool_with_own_cookie_only(self):
        call = SimpleNamespace(id="c1", function=SimpleNamespace(
            name="create_sample", arguments=json.dumps({"description": "blood"})))
        create = AsyncMock(side_effect=[groq_reply(tool_calls=[call]),
                                        groq_reply("Created sample 7.")])
        execute = AsyncMock(return_value=SimpleNamespace(
            model_dump=lambda: {"id": 7}))
        d, g = self._patches(create)
        with d, g, patch.object(svc, "execute_mcp_tool", new=execute):
            out = await svc.process_chat_with_tools("Register sample: blood", ctx("USER"))
        self.assertEqual(out, "Created sample 7.")
        self.assertEqual(execute.call_args.kwargs["auth_context"].role, "USER")

    async def test_admin_creation_rejected_before_groq(self):
        create = AsyncMock()
        d, g = self._patches(create)
        with d, g:
            for msg in ("How can I register a new sample?",
                        "create a sample", "add a new sample please"):
                out = await svc.process_chat_with_tools(msg, ctx("ADMIN"))
                self.assertEqual(out, ADMIN_MSG)
        create.assert_not_called()

    async def test_admin_never_gets_create_tool(self):
        create = AsyncMock(return_value=groq_reply("ok"))
        d, g = self._patches(create)
        with d, g:
            await svc.process_chat_with_tools("show all samples", ctx("ADMIN"))
        names = {t["function"]["name"] for t in create.call_args.kwargs["tools"]}
        self.assertNotIn("create_sample", names)
        self.assertEqual(names, {"get_all_samples", "get_sample_by_id", "update_sample",
                                 "delete_sample", "filter_samples_by_status",
                                 "filter_samples_by_user"})

    async def test_executor_blocks_create_for_admin_even_if_groq_asks(self):
        from app.mcp_client.executor import execute_mcp_tool
        with self.assertRaises(PermissionError):
            await execute_mcp_tool("create_sample", {"description": "x"}, ctx("ADMIN"))


if __name__ == "__main__":
    unittest.main(verbosity=2)