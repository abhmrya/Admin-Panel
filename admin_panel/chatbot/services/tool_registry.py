"""
Tool Registry

This module contains:

1. GEMINI_TOOLS
   Function declarations exposed to Gemini.

2. TOOL_FUNCTIONS
   Maps function names to Python callables.

Flow

User
    ↓
Gemini
    ↓
Function Call
    ↓
ToolExecutor
    ↓
TOOL_FUNCTIONS
    ↓
DatabaseService
"""

from google.genai import types

from chatbot.services.database_service import DatabaseService


# ==========================================================
# GEMINI FUNCTION DECLARATIONS
# ==========================================================

GEMINI_TOOLS = types.Tool(
    function_declarations=[

        # ==================================================
        # USERS
        # ==================================================

        types.FunctionDeclaration(
            name="get_user_statistics",
            description="Return complete user statistics.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

        types.FunctionDeclaration(
            name="get_recent_users",
            description="Return recently registered users.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of users."
                    }
                },
            },
        ),

        types.FunctionDeclaration(
            name="get_users_by_role",
            description="Return users of a specific role.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "role": {
                        "type": "string",
                        "description": "Role name."
                    }
                },
                "required": [
                    "role"
                ],
            },
        ),

        types.FunctionDeclaration(
            name="search_users",
            description="Search users by name, username or email.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string"
                    }
                },
                "required": [
                    "keyword"
                ],
            },
        ),

        # ==================================================
        # DEPARTMENTS
        # ==================================================

        types.FunctionDeclaration(
            name="get_department_statistics",
            description="Return department statistics.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

        types.FunctionDeclaration(
            name="get_departments",
            description="Return all departments.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

        types.FunctionDeclaration(
            name="get_department_users",
            description="Return users of a department.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "department_name": {
                        "type": "string"
                    }
                },
                "required": [
                    "department_name"
                ],
            },
        ),

        types.FunctionDeclaration(
            name="get_department_employee_count",
            description="Return employee count of every department.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

        # ==================================================
        # AUDIT LOG
        # ==================================================

        types.FunctionDeclaration(
            name="get_latest_audit_logs",
            description="Return latest audit logs.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer"
                    }
                },
            },
        ),

        types.FunctionDeclaration(
            name="get_today_audit_logs",
            description="Return today's audit logs.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

        types.FunctionDeclaration(
            name="get_logs_by_action",
            description="Return audit logs filtered by action.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string"
                    }
                },
                "required": [
                    "action"
                ],
            },
        ),

        # ==================================================
        # DASHBOARD
        # ==================================================

        types.FunctionDeclaration(
            name="get_dashboard_summary",
            description="Return dashboard summary.",
            parameters_json_schema={
                "type": "object",
                "properties": {},
            },
        ),

    ]
)


# ==========================================================
# PYTHON FUNCTION REGISTRY
# ==========================================================

TOOL_FUNCTIONS = {

    # Users

    "get_user_statistics": DatabaseService.get_user_statistics,

    "get_recent_users": DatabaseService.get_recent_users,

    "get_users_by_role": DatabaseService.get_users_by_role,

    "search_users": DatabaseService.search_users,


    # Departments

    "get_department_statistics": DatabaseService.get_department_statistics,

    "get_departments": DatabaseService.get_departments,

    "get_department_users": DatabaseService.get_department_users,

    "get_department_employee_count": DatabaseService.get_department_employee_count,


    # Audit

    "get_latest_audit_logs": DatabaseService.get_latest_audit_logs,

    "get_today_audit_logs": DatabaseService.get_today_audit_logs,

    "get_logs_by_action": DatabaseService.get_logs_by_action,


    # Dashboard

    "get_dashboard_summary": DatabaseService.get_dashboard_summary,

}