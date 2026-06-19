"""Minimal advanced CRM platform core with auth, workspaces, leads, pipeline, tasks and analytics."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen


class CRMError(Exception):
    """Base error for CRM platform."""


class AuthenticationError(CRMError):
    """Raised when authentication fails."""


class AuthorizationError(CRMError):
    """Raised when authorization fails."""


class ValidationError(CRMError):
    """Raised when input validation fails."""


class NotFoundError(CRMError):
    """Raised when entities are not found."""


@dataclass(frozen=True)
class SupabaseConfig:
    url: str = ""
    api_key: str = ""
    table_prefix: str = "crm_"

    @classmethod
    def from_env(cls) -> "SupabaseConfig":
        return cls(
            url=os.getenv("SUPABASE_URL", "").strip(),
            api_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip(),
            table_prefix=os.getenv("SUPABASE_TABLE_PREFIX", "crm_").strip() or "crm_",
        )


class SupabaseIntegration:
    """Small adapter for optional Supabase synchronization."""

    def __init__(self, config: SupabaseConfig | None = None) -> None:
        self.config = config or SupabaseConfig.from_env()

    @property
    def enabled(self) -> bool:
        return bool(self.config.url and self.config.api_key)

    def upsert(self, resource: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.enabled:
            return {
                "synced": False,
                "resource": resource,
                "reason": "supabase_not_configured",
            }

        endpoint = f"{self.config.url.rstrip('/')}/rest/v1/{self.config.table_prefix}{resource}"
        request = Request(
            endpoint,
            data=json.dumps([payload]).encode("utf-8"),
            method="POST",
            headers={
                "Content-Type": "application/json",
                "apikey": self.config.api_key,
                "Authorization": self.config.api_key,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )

        try:
            with urlopen(request, timeout=5) as response:  # noqa: S310
                return {
                    "synced": 200 <= response.status < 300,
                    "resource": resource,
                    "status_code": response.status,
                }
        except URLError as error:
            return {
                "synced": False,
                "resource": resource,
                "reason": str(error),
            }


class CRMPlatform:
    """SQLite-backed CRM platform with user-scoped workspace data."""

    def __init__(self, db_path: str = ":memory:", supabase: SupabaseIntegration | None = None) -> None:
        self.db = sqlite3.connect(db_path)
        self.db.row_factory = sqlite3.Row
        self.supabase = supabase or SupabaseIntegration()
        self._setup_schema()

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    def _setup_schema(self) -> None:
        with self.db:
            self.db.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );

                CREATE TABLE IF NOT EXISTS workspaces (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    owner_user_id INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(owner_user_id) REFERENCES users(id)
                );

                CREATE TABLE IF NOT EXISTS workspace_members (
                    workspace_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    role TEXT NOT NULL,
                    PRIMARY KEY(workspace_id, user_id),
                    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );

                CREATE TABLE IF NOT EXISTS leads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    workspace_id INTEGER NOT NULL,
                    owner_user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT,
                    status TEXT NOT NULL,
                    pipeline_stage TEXT NOT NULL,
                    value REAL NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
                    FOREIGN KEY(owner_user_id) REFERENCES users(id)
                );

                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    workspace_id INTEGER NOT NULL,
                    lead_id INTEGER,
                    assignee_user_id INTEGER NOT NULL,
                    created_by_user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    due_date TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
                    FOREIGN KEY(lead_id) REFERENCES leads(id),
                    FOREIGN KEY(assignee_user_id) REFERENCES users(id),
                    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
                );
                """
            )

    @staticmethod
    def _hash_password(password: str) -> str:
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        salt = secrets.token_hex(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return f"{salt}${digest.hex()}"

    @staticmethod
    def _verify_password(password: str, stored_hash: str) -> bool:
        salt, expected_hash = stored_hash.split("$", 1)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(digest.hex(), expected_hash)

    def register_user(self, email: str, password: str) -> dict[str, Any]:
        normalized_email = (email or "").strip().lower()
        if "@" not in normalized_email:
            raise ValidationError("A valid email is required")

        password_hash = self._hash_password(password)
        now = self._now()

        try:
            with self.db:
                cursor = self.db.execute(
                    "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
                    (normalized_email, password_hash, now),
                )
            user = {"id": cursor.lastrowid, "email": normalized_email, "created_at": now}
            self.supabase.upsert("users", user)
            return user
        except sqlite3.IntegrityError as error:
            raise ValidationError("Email already exists") from error

    def authenticate_user(self, email: str, password: str, session_hours: int = 12) -> str:
        row = self.db.execute("SELECT id, password_hash FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
        if not row or not self._verify_password(password, row["password_hash"]):
            raise AuthenticationError("Invalid credentials")

        token = secrets.token_urlsafe(32)
        now = self._now()
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=session_hours)).isoformat()
        with self.db:
            self.db.execute(
                "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                (token, row["id"], expires_at, now),
            )
        return token

    def _user_id_from_token(self, token: str) -> int:
        session = self.db.execute(
            "SELECT user_id, expires_at FROM sessions WHERE token = ?",
            (token,),
        ).fetchone()
        if not session:
            raise AuthenticationError("Invalid session token")

        if datetime.fromisoformat(session["expires_at"]) <= datetime.now(timezone.utc):
            raise AuthenticationError("Session has expired")
        return int(session["user_id"])

    def create_workspace(self, token: str, name: str) -> dict[str, Any]:
        user_id = self._user_id_from_token(token)
        if not name.strip():
            raise ValidationError("Workspace name is required")
        now = self._now()
        with self.db:
            cursor = self.db.execute(
                "INSERT INTO workspaces (name, owner_user_id, created_at) VALUES (?, ?, ?)",
                (name.strip(), user_id, now),
            )
            workspace_id = cursor.lastrowid
            self.db.execute(
                "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)",
                (workspace_id, user_id, "owner"),
            )

        workspace = {"id": workspace_id, "name": name.strip(), "owner_user_id": user_id, "created_at": now}
        self.supabase.upsert("workspaces", workspace)
        return workspace

    def _workspace_access(self, user_id: int, workspace_id: int) -> str:
        membership = self.db.execute(
            "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?",
            (workspace_id, user_id),
        ).fetchone()
        if not membership:
            raise AuthorizationError("User cannot access this workspace")
        return str(membership["role"])

    def add_workspace_member(self, token: str, workspace_id: int, member_user_id: int, role: str = "member") -> None:
        user_id = self._user_id_from_token(token)
        if self._workspace_access(user_id, workspace_id) != "owner":
            raise AuthorizationError("Only workspace owners can add members")
        with self.db:
            self.db.execute(
                "INSERT OR REPLACE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)",
                (workspace_id, member_user_id, role),
            )

    def create_lead(
        self,
        token: str,
        workspace_id: int,
        name: str,
        *,
        email: str = "",
        status: str = "new",
        pipeline_stage: str = "qualification",
        value: float = 0.0,
    ) -> dict[str, Any]:
        user_id = self._user_id_from_token(token)
        self._workspace_access(user_id, workspace_id)
        if not name.strip():
            raise ValidationError("Lead name is required")
        now = self._now()
        with self.db:
            cursor = self.db.execute(
                """
                INSERT INTO leads (workspace_id, owner_user_id, name, email, status, pipeline_stage, value, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (workspace_id, user_id, name.strip(), email.strip(), status, pipeline_stage, float(value), now, now),
            )
        lead = {
            "id": cursor.lastrowid,
            "workspace_id": workspace_id,
            "owner_user_id": user_id,
            "name": name.strip(),
            "email": email.strip(),
            "status": status,
            "pipeline_stage": pipeline_stage,
            "value": float(value),
            "created_at": now,
            "updated_at": now,
        }
        self.supabase.upsert("leads", lead)
        return lead

    def update_lead_stage(
        self,
        token: str,
        workspace_id: int,
        lead_id: int,
        pipeline_stage: str,
        *,
        status: str | None = None,
    ) -> dict[str, Any]:
        user_id = self._user_id_from_token(token)
        self._workspace_access(user_id, workspace_id)

        lead = self.db.execute(
            "SELECT * FROM leads WHERE id = ? AND workspace_id = ?",
            (lead_id, workspace_id),
        ).fetchone()
        if not lead:
            raise NotFoundError("Lead not found")

        now = self._now()
        next_status = status or lead["status"]
        with self.db:
            self.db.execute(
                "UPDATE leads SET pipeline_stage = ?, status = ?, updated_at = ? WHERE id = ?",
                (pipeline_stage, next_status, now, lead_id),
            )

        updated = {
            "id": lead_id,
            "workspace_id": workspace_id,
            "pipeline_stage": pipeline_stage,
            "status": next_status,
            "updated_at": now,
        }
        self.supabase.upsert("leads", updated)
        return updated

    def create_task(
        self,
        token: str,
        workspace_id: int,
        title: str,
        *,
        assignee_user_id: int,
        description: str = "",
        due_date: str | None = None,
        lead_id: int | None = None,
    ) -> dict[str, Any]:
        created_by = self._user_id_from_token(token)
        self._workspace_access(created_by, workspace_id)
        self._workspace_access(assignee_user_id, workspace_id)
        if not title.strip():
            raise ValidationError("Task title is required")

        now = self._now()
        with self.db:
            cursor = self.db.execute(
                """
                INSERT INTO tasks (
                    workspace_id, lead_id, assignee_user_id, created_by_user_id,
                    title, description, due_date, completed, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                """,
                (workspace_id, lead_id, assignee_user_id, created_by, title.strip(), description.strip(), due_date, now, now),
            )
        task = {
            "id": cursor.lastrowid,
            "workspace_id": workspace_id,
            "lead_id": lead_id,
            "assignee_user_id": assignee_user_id,
            "created_by_user_id": created_by,
            "title": title.strip(),
            "description": description.strip(),
            "due_date": due_date,
            "completed": False,
            "created_at": now,
            "updated_at": now,
        }
        self.supabase.upsert("tasks", task)
        return task

    def complete_task(self, token: str, workspace_id: int, task_id: int) -> dict[str, Any]:
        user_id = self._user_id_from_token(token)
        self._workspace_access(user_id, workspace_id)

        task = self.db.execute(
            "SELECT id FROM tasks WHERE id = ? AND workspace_id = ?",
            (task_id, workspace_id),
        ).fetchone()
        if not task:
            raise NotFoundError("Task not found")

        now = self._now()
        with self.db:
            self.db.execute(
                "UPDATE tasks SET completed = 1, updated_at = ? WHERE id = ?",
                (now, task_id),
            )
        updated = {"id": task_id, "workspace_id": workspace_id, "completed": True, "updated_at": now}
        self.supabase.upsert("tasks", updated)
        return updated

    def workspace_analytics(self, token: str, workspace_id: int) -> dict[str, Any]:
        user_id = self._user_id_from_token(token)
        self._workspace_access(user_id, workspace_id)

        leads = self.db.execute(
            "SELECT status, pipeline_stage, value FROM leads WHERE workspace_id = ?",
            (workspace_id,),
        ).fetchall()
        tasks = self.db.execute(
            "SELECT completed FROM tasks WHERE workspace_id = ?",
            (workspace_id,),
        ).fetchall()

        leads_by_status: dict[str, int] = {}
        leads_by_stage: dict[str, int] = {}
        total_pipeline_value = 0.0

        for lead in leads:
            leads_by_status[lead["status"]] = leads_by_status.get(lead["status"], 0) + 1
            leads_by_stage[lead["pipeline_stage"]] = leads_by_stage.get(lead["pipeline_stage"], 0) + 1
            total_pipeline_value += float(lead["value"])

        completed_tasks = sum(1 for task in tasks if int(task["completed"]) == 1)
        open_tasks = len(tasks) - completed_tasks

        return {
            "workspace_id": workspace_id,
            "total_leads": len(leads),
            "leads_by_status": leads_by_status,
            "pipeline_by_stage": leads_by_stage,
            "total_pipeline_value": round(total_pipeline_value, 2),
            "total_tasks": len(tasks),
            "completed_tasks": completed_tasks,
            "open_tasks": open_tasks,
        }
