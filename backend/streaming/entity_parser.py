"""Entity extraction from markdown markers.

The agent emits structured entities using markdown markers:
- :::contact ... ::: for Contact cards
- :::event ... ::: for CalendarEvent cards

Entities are embedded in JSON code blocks within the markers.
This parser extracts and validates them against the frontend schemas.
"""
import json
import re
import logging
from typing import Literal, TypedDict, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class EntityType(str, Enum):
    CONTACT = "contact"
    EVENT = "event"


class ContactEntity(TypedDict, total=False):
    """Matches frontend ContactCardProps interface."""
    name: str  # required
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    avatar: Optional[str]


class CalendarEventEntity(TypedDict, total=False):
    """Matches frontend CalendarEventProps interface."""
    title: str  # required
    date: str   # required
    startTime: Optional[str]
    endTime: Optional[str]
    location: Optional[str]
    description: Optional[str]


class ExtractedEntity(TypedDict):
    """Extracted entity with type and data."""
    type: EntityType
    data: ContactEntity | CalendarEventEntity
    raw: str  # Original marker text for replacement


# Regex patterns for entity markers
# Format: :::type\n```json\n{...}\n```\n:::
CONTACT_PATTERN = re.compile(
    r':::contact\s*\n```json\s*\n(.*?)\n```\s*\n:::',
    re.DOTALL
)
EVENT_PATTERN = re.compile(
    r':::event\s*\n```json\s*\n(.*?)\n```\s*\n:::',
    re.DOTALL
)


def extract_entities(markdown: str) -> list[ExtractedEntity]:
    """Extract all entities from markdown content.

    Args:
        markdown: The markdown content to parse

    Returns:
        List of extracted entities with type, data, and raw marker text
    """
    entities = []

    # Extract contacts
    for match in CONTACT_PATTERN.finditer(markdown):
        try:
            json_str = match.group(1).strip()
            data = json.loads(json_str)

            # Validate required field
            if "name" not in data:
                logger.warning(f"Contact missing required 'name' field: {json_str[:50]}")
                continue

            entities.append({
                "type": EntityType.CONTACT,
                "data": data,
                "raw": match.group(0),
            })
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse contact JSON: {e}")
            continue

    # Extract events
    for match in EVENT_PATTERN.finditer(markdown):
        try:
            json_str = match.group(1).strip()
            data = json.loads(json_str)

            # Validate required fields
            if "title" not in data or "date" not in data:
                logger.warning(f"Event missing required fields: {json_str[:50]}")
                continue

            entities.append({
                "type": EntityType.EVENT,
                "data": data,
                "raw": match.group(0),
            })
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse event JSON: {e}")
            continue

    return entities


def validate_contact(data: dict) -> bool:
    """Validate contact data against ContactCardProps schema."""
    if not isinstance(data.get("name"), str):
        return False
    # Optional fields can be missing or string
    for field in ["email", "phone", "address", "avatar"]:
        if field in data and not isinstance(data[field], str):
            return False
    return True


def validate_event(data: dict) -> bool:
    """Validate event data against CalendarEventProps schema."""
    if not isinstance(data.get("title"), str):
        return False
    if not isinstance(data.get("date"), str):
        return False
    # Optional fields
    for field in ["startTime", "endTime", "location", "description"]:
        if field in data and not isinstance(data[field], str):
            return False
    return True
