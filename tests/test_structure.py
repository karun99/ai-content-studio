"""Structural smoke tests for the AI Content Studio monorepo.

These guard the top-level workspace layout so accidental deletions of a
component (frontend, backend or the Python service) fail fast in CI.
"""
from __future__ import annotations

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _exists(*parts: str) -> bool:
    return os.path.exists(os.path.join(ROOT, *parts))


def test_frontend_present():
    assert _exists("frontend"), "frontend/ directory is missing"


def test_backend_present():
    assert _exists("backend"), "backend/ directory is missing"


def test_python_service_present():
    assert _exists("python-service"), "python-service/ directory is missing"
