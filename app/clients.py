import asyncio
import inspect
import json
import logging
import os
from functools import lru_cache
from typing import Any, Callable, TypeVar

from dotenv import load_dotenv
from openai import OpenAI
from redis import asyncio as aioredis
from redis.exceptions import RedisError
from supabase import AsyncClient, create_async_client

load_dotenv()

logger = logging.getLogger(__name__)
ModelType = TypeVar("ModelType")

GROK_TEXT_MODEL = "grok-4.3"
GROK_VISION_MAX_TOKENS = 500
REQUIRED_ENV_VARS = (
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "XAI_API_KEY",
)


def validate_env() -> None:
    missing = [name for name in REQUIRED_ENV_VARS if not os.environ.get(name)]
    if missing:
        missing_list = ", ".join(missing)
        raise RuntimeError(f"Missing required environment variables: {missing_list}")


def _required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _supabase_anon_key() -> str:
    return _required_env("SUPABASE_ANON_KEY")


def _supabase_service_role_key() -> str:
    return _required_env("SUPABASE_SERVICE_ROLE_KEY")


@lru_cache(maxsize=1)
def get_grok_client() -> OpenAI:
    return OpenAI(
        api_key=_required_env("XAI_API_KEY"),
        base_url="https://api.x.ai/v1",
    )


@lru_cache(maxsize=1)
def get_redis_client() -> aioredis.Redis | None:
    redis_url = os.environ.get("UPSTASH_REDIS_URL")
    if not redis_url:
        return None
    return aioredis.from_url(redis_url, decode_responses=True)


async def get_or_set_cache(
    key: str,
    fetch_fn: Callable[[], Any],
    ttl_seconds: int = 3600,
    model_class: type[ModelType] | None = None,
) -> Any:
    """Read from Redis when available, otherwise compute and cache the value."""
    redis_client = get_redis_client()
    if redis_client is not None:
        try:
            cached_value = await redis_client.get(key)
            if cached_value is not None:
                try:
                    parsed_value = json.loads(cached_value)
                except json.JSONDecodeError:
                    parsed_value = cached_value
                if model_class is not None:
                    # Cache must return the same type as a fresh call — a cache hit returning a raw dict instead of the expected Pydantic model will break downstream attribute access.
                    if isinstance(parsed_value, dict):
                        return model_class.model_validate(parsed_value)
                    return model_class.model_validate(parsed_value)
                return parsed_value
        except RedisError as exc:
            logger.warning("Redis cache read failed for key %s: %s", key, exc)

    if inspect.iscoroutinefunction(fetch_fn):
        result = await fetch_fn()
    else:
        result = await asyncio.to_thread(fetch_fn)

    if model_class is not None and not isinstance(result, model_class):
        result = model_class.model_validate(result)

    if redis_client is not None:
        try:
            if hasattr(result, "model_dump"):
                payload = result.model_dump()
            elif hasattr(result, "dict"):
                payload = result.dict()
            elif isinstance(result, (str, int, float, bool)) or result is None:
                payload = result
            else:
                payload = result
            serialized_value = json.dumps(payload) if not isinstance(payload, str) else payload
            await redis_client.setex(key, ttl_seconds, serialized_value)
        except RedisError as exc:
            logger.warning("Redis cache write failed for key %s: %s", key, exc)
        except TypeError:
            logger.warning("Unable to serialize cache payload for key %s", key)

    return result


async def get_supabase_client(
    access_token: str | None = None,
    *,
    service_role: bool = False,
) -> AsyncClient:
    """Create an async Supabase client, optionally scoped to a user's JWT."""
    key = _supabase_service_role_key() if service_role else _supabase_anon_key()
    client = await create_async_client(_required_env("SUPABASE_URL"), key)
    if access_token:
        client.postgrest.auth(access_token)
    return client
