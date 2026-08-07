"""
Tool Executor

Responsible for executing Python functions
requested by Gemini.

Flow

Gemini
    ↓
Function Name
    ↓
Tool Executor
    ↓
Database Service
"""

from chatbot.services.tool_registry import TOOL_FUNCTIONS


class ToolExecutor:
    """
    Executes registered tools.
    """

    @staticmethod
    def execute(
        tool_name,
        arguments=None,
    ):
        """
        Execute a registered tool.

        Example

        execute(
            "get_department_users",
            {
                "department_name": "HR"
            }
        )
        """

        if arguments is None:
            arguments = {}

        function = TOOL_FUNCTIONS.get(tool_name)

        if function is None:
            raise ValueError(
                f"Unknown tool: {tool_name}"
            )

        return function(**arguments)