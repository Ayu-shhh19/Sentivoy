"""Keep a Render free web service awake with a periodic public health call.

Render spins a free web service down after about 15 minutes with no inbound
HTTP traffic. An in-process timer does not count. This loop calls the service's
own public URL, which comes back in as a real request.
"""

import asyncio
import logging
import os

import httpx

logger = logging.getLogger(__name__)

INTERVAL_SECONDS = 10 * 60


def public_base_url() -> str:
    """Public origin to ping. Render sets RENDER_EXTERNAL_URL automatically."""
    raw = os.getenv("KEEP_ALIVE_URL") or os.getenv("RENDER_EXTERNAL_URL") or ""
    return raw.strip().rstrip("/")


def keep_alive_enabled() -> bool:
    flag = os.getenv("KEEP_ALIVE_ENABLED", "true").strip().lower()
    return flag not in {"0", "false", "no", "off"}


async def keep_alive_loop() -> None:
    base = public_base_url()
    if not base or not keep_alive_enabled():
        logger.info("keep-alive idle (no public URL, or KEEP_ALIVE_ENABLED is off)")
        return

    url = f"{base}/api/health"
    logger.info("keep-alive will call %s every %s seconds", url, INTERVAL_SECONDS)
    await asyncio.sleep(30)
    while True:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(url)
            logger.info("keep-alive %s -> %s", url, response.status_code)
        except Exception as exc:
            logger.warning("keep-alive failed for %s: %s", url, exc)
        await asyncio.sleep(INTERVAL_SECONDS)
