import time

from django.conf import settings

from google.genai import types

from chatbot.clients.gemini_client import client
from chatbot.services.prompt_service import SYSTEM_PROMPT
from chatbot.services.tool_registry import GEMINI_TOOLS


class AIService:
    """
    AI Service

    Responsible for:
    - Gemini communication
    - Function calling
    - Normal AI response
    """


    @staticmethod
    def build_history(messages):
        """
        Convert database messages
        into Gemini format.
        """

        contents = []


        # System prompt

        contents.append(
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(
                        text=SYSTEM_PROMPT
                    )
                ],
            )
        )


        for message in messages:

            role = (
                "model"
                if message.role == "ASSISTANT"
                else "user"
            )


            contents.append(
                types.Content(
                    role=role,
                    parts=[
                        types.Part.from_text(
                            text=message.content
                        )
                    ],
                )
            )


        return contents



    @staticmethod
    def get_config():
        """
        Gemini configuration.
        """

        return types.GenerateContentConfig(

            temperature=0.3,

            max_output_tokens=2048,

            tools=[
                GEMINI_TOOLS
            ]

        )
    
    @staticmethod
    def generate_response(messages):
        """
        Generate AI response.

        Handles:
        - Normal conversation
        - Tool calling request
        """

        start_time = time.perf_counter()


        history = AIService.build_history(
            messages
        )


        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=history,
            config=AIService.get_config(),
        )


        response_time = round(
            time.perf_counter() - start_time,
            2
        )


        # --------------------------------
        # Check Function Call
        # --------------------------------

        if response.function_calls:

            return {
                "type": "tool_call",

                "function_calls": response.function_calls,

                "response_time": response_time,
            }


        # --------------------------------
        # Normal AI Response
        # --------------------------------

        return {
            "type": "text",

            "content": response.text,

            "response_time": response_time,
        }


    @staticmethod
    def execute_function_calls(
        function_calls,
        history,
    ):
        """
        Execute Gemini requested tools
        and get final AI response.
        """

        from chatbot.services.tool_executor import ToolExecutor


        tool_parts = []


        for call in function_calls:

            function_name = call.name

            arguments = dict(
                call.args
            )


            # Execute database function

            result = ToolExecutor.execute(
                tool_name=function_name,
                arguments=arguments,
            )


            # Create function response

            tool_parts.append(

                types.Part.from_function_response(

                    name=function_name,

                    response={
                        "result": result
                    }

                )

            )


        # Add tool response to history

        history.append(

            types.Content(

                role="user",

                parts=tool_parts

            )

        )


        # Ask Gemini for final answer

        response = client.models.generate_content(

            model=settings.GEMINI_MODEL,

            contents=history,

            config=AIService.get_config(),

        )
        text = response.text.strip()

        print("GEMINI TOOL RESPONSE:")
        print(text)


        return {

            "type": "text",

            "content": response.text,

        }

    @staticmethod
    def chat(messages):
        """
        Main AI entry point.

        Flow:

        User Message
              |
              ↓
        Gemini
              |
        Function Call?
              |
        Yes ----> Execute Tool
              |
              ↓
        Final Gemini Response

        No
              |
              ↓
        Normal Response
        """

        try:

            result = AIService.generate_response(
                messages
            )


            # -----------------------------
            # Tool Calling Flow
            # -----------------------------

            if result["type"] == "tool_call":


                history = AIService.build_history(
                    messages
                )


                final_response = AIService.execute_function_calls(
                    function_calls=result["function_calls"],
                    history=history,
                )


                return {

                    "content": final_response["content"],

                    "response_time": result["response_time"],

                    "tool_used": [
                        call.name
                        for call in result["function_calls"]
                    ]

                }



            # -----------------------------
            # Normal AI Flow
            # -----------------------------

            return {

                "content": result["content"],

                "response_time": result["response_time"],

                "tool_used": None

            }



        except Exception as e:


            return {

                "content":
                    "Sorry, I was unable to process your request.",

                "response_time": 0,

                "tool_used": None,

                "error": str(e)

            }