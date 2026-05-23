#!/usr/bin/env bash
# Start the CricSentinel ADK agent service on port 8000
set -e
cd "$(dirname "$0")"
uv run uvicorn app.server:app --host 0.0.0.0 --port 8000 --reload
