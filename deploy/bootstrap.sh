#!/usr/bin/env bash
# Idempotent host bootstrap: Docker Engine + Compose plugin + watchdog cron.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"

echo "==> Ensuring app directory ${APP_DIR}"
sudo mkdir -p "${APP_DIR}"
sudo chown "$(id -un):$(id -gn)" "${APP_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$(id -un)" || true
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "==> Docker Compose plugin missing; reinstalling Docker"
  curl -fsSL https://get.docker.com | sudo sh
fi

sudo systemctl enable docker
sudo systemctl start docker

# Allow current user to talk to docker without re-login when possible
if ! docker info >/dev/null 2>&1; then
  echo "==> Using sudo for docker (user not yet in docker group session)"
  DOCKER="sudo docker"
  COMPOSE="sudo docker compose"
else
  DOCKER="docker"
  COMPOSE="docker compose"
fi

chmod +x "${APP_DIR}/deploy/"*.sh 2>/dev/null || true

WATCHDOG="${APP_DIR}/deploy/watchdog.sh"
CRON_LINE="*/5 * * * * APP_DIR=${APP_DIR} ${WATCHDOG} >/dev/null 2>&1"

echo "==> Installing watchdog cron (every 5 minutes)"
TMP_CRON="$(mktemp)"
(crontab -l 2>/dev/null || true) | grep -v 'utthan/deploy/watchdog.sh' | grep -v 'utthan-watchdog' > "${TMP_CRON}" || true
echo "${CRON_LINE}" >> "${TMP_CRON}"
crontab "${TMP_CRON}"
rm -f "${TMP_CRON}"

# Ensure log file is writable
sudo touch /var/log/utthan-watchdog.log
sudo chown "$(id -un):$(id -gn)" /var/log/utthan-watchdog.log

echo "==> Bootstrap complete"
${DOCKER} --version
${COMPOSE} version
