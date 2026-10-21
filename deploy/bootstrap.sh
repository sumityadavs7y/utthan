#!/usr/bin/env bash
# Idempotent host bootstrap: Docker Engine + Compose plugin + watchdog cron.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"

echo "==> Ensuring app directory ${APP_DIR}"
sudo mkdir -p "${APP_DIR}"
sudo chown "$(id -un):$(id -gn)" "${APP_DIR}"

# A 1GB micro instance OOM-kills `npm ci` and node during deploys ("Killed" in
# the container logs). Give the kernel somewhere to spill. Best-effort: swap is
# an optimisation, so never abort the deploy over it, and never claim the last
# of a nearly-full root volume (the image build needs that space more).
if [[ -z "$(swapon --show --noheadings 2>/dev/null)" ]]; then
  SWAP_AVAIL_MB="$(df -Pm / | awk 'NR==2 {print $4}')"
  if [[ "${SWAP_AVAIL_MB}" -ge 4096 ]]; then
    echo "==> No swap found; creating 2G swapfile"
    if { sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048; } \
      && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile; then
      grep -q '^/swapfile ' /etc/fstab \
        || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
    else
      echo "==> WARNING: swapfile setup failed; continuing without swap"
      sudo rm -f /swapfile || true
    fi
  else
    echo "==> Skipping swapfile: only ${SWAP_AVAIL_MB}MB free on /"
  fi
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$(id -un)" || true
fi

# Daemon-wide log cap, so any container started outside compose is bounded too.
if [[ ! -f /etc/docker/daemon.json ]]; then
  echo "==> Installing Docker daemon log rotation defaults"
  sudo mkdir -p /etc/docker
  printf '%s\n' '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' \
    | sudo tee /etc/docker/daemon.json >/dev/null
  sudo systemctl restart docker 2>/dev/null || true
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
