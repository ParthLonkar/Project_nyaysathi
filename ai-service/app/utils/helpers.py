import json
from typing import Any


def serialize_state(state: dict) -> str:
    """Serialize state to JSON"""
    return json.dumps(state, default=str)


def deserialize_state(state_json: str) -> dict:
    """Deserialize state from JSON"""
    return json.loads(state_json)


def format_response(success: bool, data: Any = None, error: str = None) -> dict:
    """Format API response"""
    return {
        "success": success,
        "data": data,
        "error": error,
    }


def extract_text(content):
    """Extract text from various content types"""
    if hasattr(content, 'content'):
        return content.content
    return str(content)
