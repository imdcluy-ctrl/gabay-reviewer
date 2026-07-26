#!/usr/bin/env python3
import sys
import json
import os
from openai import OpenAI

def log(msg: str):
    sys.stderr.write(f"[LLM-MCP] {msg}\n")
    sys.stderr.flush()

def make_api_call(provider: str, prompt: str, system_instruction: str = "") -> str:
    try:
        if provider == "deepseek":
            api_key = os.environ.get("DEEPSEEK_API_KEY")
            if not api_key:
                return "Error: DEEPSEEK_API_KEY environment variable is not configured."
            client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
            model_name = "deepseek-chat"
        else:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return "Error: GEMINI_API_KEY environment variable is not configured."
            client = OpenAI(api_key=api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            model_name = "gemini-1.5-flash"

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.3
        )
        return response.choices[0].message.content or "No content returned."
    except Exception as e:
        return f"Error executing API call: {e}"

def main():
    log("Starting LLM MCP Server...")
    
    # Read standard input line by line
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            method = request.get("method")
            req_id = request.get("id")
            
            # If no ID, it's a notification
            if req_id is None:
                log(f"Received notification: {method}")
                continue

            response = {
                "jsonrpc": "2.0",
                "id": req_id
            }

            if method == "initialize":
                response["result"] = {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "llm-mcp-server",
                        "version": "1.0.0"
                    }
                }
            elif method == "tools/list":
                response["result"] = {
                    "tools": [
                        {
                            "name": "query_deepseek",
                            "description": "Sends a prompt to DeepSeek V4 Pro (deepseek-chat) and returns the text response.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "prompt": {"type": "string", "description": "The prompt or instruction to send to the model."},
                                    "system_instruction": {"type": "string", "description": "Optional instructions to set the system role or behavior."}
                                },
                                "required": ["prompt"]
                            }
                        },
                        {
                            "name": "query_gemini_flash",
                            "description": "Sends a prompt to Gemini 1.5/2.0 Flash model and returns the text response.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "prompt": {"type": "string", "description": "The prompt or instruction to send to the model."},
                                    "system_instruction": {"type": "string", "description": "Optional instructions to set the system role or behavior."}
                                },
                                "required": ["prompt"]
                            }
                        }
                    ]
                }
            elif method == "tools/call":
                params = request.get("params", {})
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                prompt = arguments.get("prompt", "")
                system_instruction = arguments.get("system_instruction", "")

                if tool_name == "query_deepseek":
                    result_text = make_api_call("deepseek", prompt, system_instruction)
                elif tool_name == "query_gemini_flash":
                    result_text = make_api_call("gemini-flash", prompt, system_instruction)
                else:
                    result_text = f"Error: Tool '{tool_name}' not found."

                response["result"] = {
                    "content": [
                        {
                            "type": "text",
                            "text": result_text
                        }
                    ]
                }
            else:
                response["error"] = {
                    "code": -32601,
                    "message": f"Method {method} not found"
                }

            # Write JSON-RPC response to stdout
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()

        except Exception as e:
            log(f"Error handling request: {e}")

if __name__ == "__main__":
    main()
