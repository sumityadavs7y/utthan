#!/usr/bin/env bash
# Idempotent host bootstrap: Docker Engine + Compose plugin + watchdog cron.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"

echo "==> Ensuring app directory ${APP_DIR}"
sudo mkdir -p "${APP_DIR}"
sudo chown "$(id -un):$(id -gn)" "${APP_DIR}"

# Growing an EBS volume in AWS does not grow the partition or filesystem, so a
# resized root volume still reports the old capacity (and builds still fail for
# lack of space). Reclaim the unallocated tail. Idempotent: growpart reports
# NOCHANGE and resize2fs is a no-op once the filesystem already spans the disk.
echo "==> Ensuring root filesystem spans the root volume"
ROOT_SRC="$(findmnt -no SOURCE / 2>/dev/null || true)"
if [[ "${ROOT_SRC}" == "/dev/root" ]]; then
  ROOT_SRC="$(readlink -f /dev/root)"
fi
if [[ -b "${ROOT_SRC}" ]]; then
  ROOT_PKNAME="$(lsblk -no PKNAME "${ROOT_SRC}" 2>/dev/null | head -1 | tr -d ' ')"
  ROOT_PARTNUM="$(printf '%s' "${ROOT_SRC}" | grep -oE '[0-9]+$' || true)"
  if [[ -n "${ROOT_PKNAME}" && -n "${ROOT_PARTNUM}" ]]; then
    if ! command -v growpart >/dev/null 2>&1; then
      sudo apt-get update -qq || true
      sudo apt-get install -y --no-install-recommends cloud-guest-utils || true
    fi
    sudo growpart "/dev/${ROOT_PKNAME}" "${ROOT_PARTNUM}" || true
    case "$(findmnt -no FSTYPE / 2>/dev/null)" in
      ext*) sudo resize2fs "${ROOT_SRC}" || true ;;
      xfs)  sudo xfs_growfs / || true ;;
      *)    echo "==> Unknown root fstype; grow the filesystem manually" ;;
    esac
  else
    echo "==> Could not derive root disk/partition; skipping grow"
  fi
else
  echo "==> Root source '${ROOT_SRC}' is not a block device; skipping grow"
fi
df -h /

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
