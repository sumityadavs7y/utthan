#!/usr/bin/env bash
# Ensures Docker Compose stack is running. Safe to run from cron every 5 minutes.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"
LOG_FILE="${LOG_FILE:-/var/log/utthan-watchdog.log}"
TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Runs from cron every 5 minutes forever, so this log needs its own cap.
if [[ -f "${LOG_FILE}" ]] && [[ "$(stat -c %s "${LOG_FILE}" 2>/dev/null || echo 0)" -gt 5242880 ]]; then
  tail -c 1048576 "${LOG_FILE}" > "${LOG_FILE}.tmp" 2>/dev/null \
    && mv "${LOG_FILE}.tmp" "${LOG_FILE}"
fi

mkdir -p "$(dirname "${LOG_FILE}")"
cd "${APP_DIR}"

# cron shells are not in the docker group on a fresh host.
if docker info >/dev/null 2>&1; then
  COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml"
  DOCKER="docker"
else
  COMPOSE="sudo docker compose -f ${APP_DIR}/docker-compose.yml"
  DOCKER="sudo docker"
fi

if [[ ! -f docker-compose.yml ]]; then
  echo "${TS} ERROR: docker-compose.yml missing in ${APP_DIR}" >> "${LOG_FILE}"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "${TS} ERROR: docker not installed" >> "${LOG_FILE}"
  exit 1
fi

# Bring up any stopped / missing services; leave healthy ones alone.
# Bounded so a wedged compose run cannot pile up once per 5 minutes.
if ! timeout 240 ${COMPOSE} up -d --remove-orphans >> "${LOG_FILE}" 2>&1; then
  echo "${TS} ERROR: docker compose up failed or timed out" >> "${LOG_FILE}"
  exit 1
fi

# Restart individually unhealthy containers (compose up does not always recreate them).
UNHEALTHY="$(${COMPOSE} ps --format '{{.Name}} {{.Health}}' 2>/dev/null | awk '$2 == "unhealthy" { print $1 }' || true)"
if [[ -n "${UNHEALTHY}" ]]; then
  echo "${TS} Restarting unhealthy: ${UNHEALTHY}" >> "${LOG_FILE}"
  # shellcheck disable=SC2086
  ${DOCKER} restart ${UNHEALTHY} >> "${LOG_FILE}" 2>&1 || true
fi

# Keep the host from filling up between deploys.
AVAIL_MB="$(df -Pm / | awk 'NR==2 {print $4}')"
if [[ "${AVAIL_MB}" -lt 2048 ]]; then
  echo "${TS} Low disk (${AVAIL_MB}MB free); pruning unused images + build cache" >> "${LOG_FILE}"
  ${DOCKER} system prune -af >> "${LOG_FILE}" 2>&1 || true
  ${DOCKER} builder prune -af >> "${LOG_FILE}" 2>&1 || true
fi

echo "${TS} watchdog ok" >> "${LOG_FILE}"
