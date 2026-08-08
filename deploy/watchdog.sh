#!/usr/bin/env bash
# Ensures Docker Compose stack is running. Safe to run from cron every 5 minutes.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"
LOG_FILE="${LOG_FILE:-/var/log/utthan-watchdog.log}"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml"
TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

mkdir -p "$(dirname "${LOG_FILE}")"
cd "${APP_DIR}"

if [[ ! -f docker-compose.yml ]]; then
  echo "${TS} ERROR: docker-compose.yml missing in ${APP_DIR}" >> "${LOG_FILE}"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "${TS} ERROR: docker not installed" >> "${LOG_FILE}"
  exit 1
fi

# Bring up any stopped / missing services; leave healthy ones alone.
if ! ${COMPOSE} up -d --remove-orphans >> "${LOG_FILE}" 2>&1; then
  echo "${TS} ERROR: docker compose up failed" >> "${LOG_FILE}"
  exit 1
fi

# Restart individually unhealthy containers (compose up does not always recreate them).
UNHEALTHY="$(${COMPOSE} ps --format '{{.Name}} {{.Health}}' 2>/dev/null | awk '$2 == "unhealthy" { print $1 }' || true)"
if [[ -n "${UNHEALTHY}" ]]; then
  echo "${TS} Restarting unhealthy: ${UNHEALTHY}" >> "${LOG_FILE}"
  # shellcheck disable=SC2086
  docker restart ${UNHEALTHY} >> "${LOG_FILE}" 2>&1 || true
fi

echo "${TS} watchdog ok" >> "${LOG_FILE}"
