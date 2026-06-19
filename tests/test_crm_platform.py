import unittest

from crm_platform import (
    AuthenticationError,
    AuthorizationError,
    CRMPlatform,
    SupabaseConfig,
    SupabaseIntegration,
)


class CRMPlatformTests(unittest.TestCase):
    def setUp(self):
        self.platform = CRMPlatform(db_path=":memory:")
        owner = self.platform.register_user("owner@example.com", "strong-pass")
        member = self.platform.register_user("member@example.com", "strong-pass")
        outsider = self.platform.register_user("outsider@example.com", "strong-pass")

        self.owner_id = owner["id"]
        self.member_id = member["id"]
        self.outsider_id = outsider["id"]

        self.owner_token = self.platform.authenticate_user("owner@example.com", "strong-pass")
        self.member_token = self.platform.authenticate_user("member@example.com", "strong-pass")
        self.outsider_token = self.platform.authenticate_user("outsider@example.com", "strong-pass")

        workspace = self.platform.create_workspace(self.owner_token, "Revenue Team")
        self.workspace_id = workspace["id"]
        self.platform.add_workspace_member(self.owner_token, self.workspace_id, self.member_id)

    def test_authentication_rejects_invalid_password(self):
        with self.assertRaises(AuthenticationError):
            self.platform.authenticate_user("owner@example.com", "bad-pass")

    def test_workspace_data_is_user_scoped(self):
        with self.assertRaises(AuthorizationError):
            self.platform.create_lead(
                self.outsider_token,
                self.workspace_id,
                "Blocked Lead",
                pipeline_stage="proposal",
            )

    def test_leads_pipeline_tasks_and_analytics(self):
        lead = self.platform.create_lead(
            self.owner_token,
            self.workspace_id,
            "Acme Corp",
            status="qualified",
            pipeline_stage="qualification",
            value=25000,
        )
        self.platform.update_lead_stage(
            self.member_token,
            self.workspace_id,
            lead["id"],
            "proposal",
            status="in_progress",
        )
        task = self.platform.create_task(
            self.owner_token,
            self.workspace_id,
            "Prepare proposal",
            assignee_user_id=self.member_id,
            lead_id=lead["id"],
        )
        self.platform.complete_task(self.member_token, self.workspace_id, task["id"])

        analytics = self.platform.workspace_analytics(self.member_token, self.workspace_id)
        self.assertEqual(analytics["total_leads"], 1)
        self.assertEqual(analytics["pipeline_by_stage"]["proposal"], 1)
        self.assertEqual(analytics["leads_by_status"]["in_progress"], 1)
        self.assertEqual(analytics["total_pipeline_value"], 25000.0)
        self.assertEqual(analytics["completed_tasks"], 1)
        self.assertEqual(analytics["open_tasks"], 0)


class SupabaseIntegrationTests(unittest.TestCase):
    def test_supabase_returns_not_configured_when_missing_credentials(self):
        integration = SupabaseIntegration(config=SupabaseConfig(url="", api_key=""))
        result = integration.upsert("users", {"id": 1})
        self.assertFalse(result["synced"])
        self.assertEqual(result["reason"], "supabase_not_configured")


if __name__ == "__main__":
    unittest.main()
