#!/usr/bin/env bash
# Run on the EC2 host AFTER DNS for the domain points here and SG allows 80/443.
#
#   cd /opt/utthan && ./deploy/enable-ssl.sh
#
# Defaults to theutthanfoundation.in (apex only). Set INCLUDE_WWW=1 after www
# also points to this EC2.
#
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"
DOMAIN="${DOMAIN:-theutthanfoundation.in}"
EMAIL="${CERTBOT_EMAIL:-help@theutthanfoundation.in}"
INCLUDE_WWW="${INCLUDE_WWW:-0}"
PROJECT_NAME="utthan"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml -p ${PROJECT_NAME}"
NGINX_ONLY="${1:-}"

cd "${APP_DIR}"

if [[ ! -f docker-compose.yml ]]; then
  echo "ERROR: ${APP_DIR}/docker-compose.yml not found"
  exit 1
fi

apply_ssl_nginx() {
  # Prefer checked-in SSL template; rewrite paths if DOMAIN differs.
  sed "s/theutthanfoundation\\.in/${DOMAIN}/g" \
    "${APP_DIR}/deploy/nginx/default.ssl.conf" \
    > "${APP_DIR}/deploy/nginx/default.conf"
  touch "${APP_DIR}/deploy/nginx/.ssl-enabled"
  echo "${DOMAIN}" > "${APP_DIR}/deploy/nginx/.ssl-domain"
}

if [[ "${NGINX_ONLY}" == "--nginx-only" ]]; then
  echo "==> Restoring HTTPS nginx config (certs already issued)"
  if [[ -f "${APP_DIR}/deploy/nginx/.ssl-domain" ]]; then
    DOMAIN="$(cat "${APP_DIR}/deploy/nginx/.ssl-domain")"
  fi

  # rsync has just restored the HTTP default.conf; keep it as the fallback.
  HTTP_CONF_BAK="${APP_DIR}/deploy/nginx/.default.http.conf"
  cp "${APP_DIR}/deploy/nginx/default.conf" "${HTTP_CONF_BAK}"

  # Preflight: the HTTPS config hard-requires the cert and dhparams. If either
  # is missing nginx exits at startup, which takes the whole site offline --
  # serving plain HTTP is far better than serving nothing.
  SSL_READY=1
  # nginx:alpine is already on the host, and --entrypoint skips its launcher.
  if ! docker run --rm --entrypoint test \
      -v "${PROJECT_NAME}_certbot_certs:/etc/letsencrypt" \
      nginx:1.27-alpine -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"; then
    echo "WARNING: no certificate for ${DOMAIN} in ${PROJECT_NAME}_certbot_certs"
    SSL_READY=0

    # HTTPS was enabled here before, so the certs went missing (a recreated
    # certbot_certs volume loses them while .ssl-enabled survives, since rsync
    # excludes it). Re-issue rather than silently serving HTTP forever.
    # Throttled: Let's Encrypt rate-limits failed validations, and this runs on
    # every deploy.
    ATTEMPT_STAMP="${APP_DIR}/deploy/nginx/.ssl-last-attempt"
    NOW="$(date +%s)"
    PREV="$(cat "${ATTEMPT_STAMP}" 2>/dev/null || echo 0)"
    if (( NOW - PREV > 21600 )); then
      echo "==> Re-issuing certificate for ${DOMAIN} (last attempt $(( (NOW - PREV) / 3600 ))h ago)"
      echo "${NOW}" > "${ATTEMPT_STAMP}"
      # The full path issues the cert and applies the HTTPS config itself.
      if "$0"; then
        exit 0
      fi
      echo "WARNING: certificate issuance failed; staying on HTTP"
    else
      echo "==> Skipping issuance: attempted less than 6h ago"
    fi
  fi
  if [[ ! -f "${APP_DIR}/deploy/nginx/ssl/ssl-dhparams.pem" ]]; then
    # nginx:alpine ships no openssl CLI, so use alpine like the issuance path.
    echo "WARNING: deploy/nginx/ssl/ssl-dhparams.pem missing; regenerating"
    mkdir -p "${APP_DIR}/deploy/nginx/ssl"
    if ! docker run --rm -v "${APP_DIR}/deploy/nginx/ssl:/out" alpine:3.20 \
        sh -c 'apk add --no-cache openssl >/dev/null && openssl dhparam -out /out/ssl-dhparams.pem 2048'; then
      echo "WARNING: could not generate dhparams"
      SSL_READY=0
    fi
  fi

  if [[ "${SSL_READY}" != "1" ]]; then
    echo "==> Keeping HTTP config; run ./deploy/enable-ssl.sh to (re)issue certs"
    # A failed issuance attempt above may have left the HTTPS config in place,
    # which nginx cannot load without certs. Always restore the HTTP one here.
    cp "${HTTP_CONF_BAK}" "${APP_DIR}/deploy/nginx/default.conf"
    ${COMPOSE} up -d --force-recreate nginx || true
    exit 0
  fi

  apply_ssl_nginx
  # Recreate so bind-mounted default.conf picks up a replaced inode.
  ${COMPOSE} up -d --force-recreate nginx || true
  if ${COMPOSE} exec -T nginx nginx -t; then
    echo "==> Nginx HTTPS config restored for ${DOMAIN}"
    exit 0
  fi

  # Never leave nginx down over a bad HTTPS config.
  echo "ERROR: nginx rejected the HTTPS config; reverting to HTTP so the site stays up"
  ${COMPOSE} logs --tail=50 nginx || true
  cp "${HTTP_CONF_BAK}" "${APP_DIR}/deploy/nginx/default.conf"
  # Leave .ssl-enabled in place: the preflight above now fails safe, so the
  # next deploy can retry HTTPS instead of silently staying on HTTP forever.
  ${COMPOSE} up -d --force-recreate nginx || true
  ${COMPOSE} exec -T nginx nginx -t || true
  exit 0
fi

# Ensure HTTP nginx has ACME location before requesting cert
cp "${APP_DIR}/deploy/nginx/default.conf" "${APP_DIR}/deploy/nginx/default.conf.bak" 2>/dev/null || true
# Make sure HTTP config is active (not SSL) during issuance if coming from fresh
if [[ ! -f "${APP_DIR}/deploy/nginx/.ssl-enabled" ]]; then
  # Keep current HTTP default.conf from deploy
  ${COMPOSE} up -d nginx
  ${COMPOSE} exec -T nginx nginx -s reload || true
fi

${COMPOSE} up -d

CERT_ARGS=(-d "${DOMAIN}")
if [[ "${INCLUDE_WWW}" == "1" ]]; then
  CERT_ARGS+=(-d "www.${DOMAIN}")
  echo "==> Requesting Let's Encrypt certificate for ${DOMAIN} and www.${DOMAIN}"
else
  echo "==> Requesting Let's Encrypt certificate for ${DOMAIN} (apex only; set INCLUDE_WWW=1 when www DNS points here)"
fi

docker run --rm \
  -v "${PROJECT_NAME}_certbot_www:/var/www/certbot" \
  -v "${PROJECT_NAME}_certbot_certs:/etc/letsencrypt" \
  certbot/certbot certonly \
    --webroot -w /var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    "${CERT_ARGS[@]}"

echo "==> Generating DH params if missing"
docker run --rm \
  -v "${PROJECT_NAME}_certbot_certs:/etc/letsencrypt" \
  alpine:3.20 \
  sh -c 'apk add --no-cache openssl >/dev/null && test -f /etc/letsencrypt/ssl-dhparams.pem || openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048'

mkdir -p "${APP_DIR}/deploy/nginx/ssl"
docker run --rm \
  -v "${PROJECT_NAME}_certbot_certs:/etc/letsencrypt" \
  -v "${APP_DIR}/deploy/nginx/ssl:/out" \
  alpine:3.20 \
  sh -c 'cp /etc/letsencrypt/ssl-dhparams.pem /out/ssl-dhparams.pem'

echo "==> Writing HTTPS nginx config"
apply_ssl_nginx

echo "==> Reloading nginx"
${COMPOSE} up -d --force-recreate nginx
${COMPOSE} exec -T nginx nginx -t

CRON_LINE="0 3,15 * * * cd ${APP_DIR} && docker run --rm -v ${PROJECT_NAME}_certbot_www:/var/www/certbot -v ${PROJECT_NAME}_certbot_certs:/etc/letsencrypt certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker compose -p ${PROJECT_NAME} exec -T nginx nginx -s reload >> /var/log/utthan-certbot.log 2>&1"
TMP_CRON="$(mktemp)"
(crontab -l 2>/dev/null || true) | grep -v 'utthan-certbot\|certbot renew' > "${TMP_CRON}" || true
echo "${CRON_LINE}" >> "${TMP_CRON}"
crontab "${TMP_CRON}"
rm -f "${TMP_CRON}"

echo "==> SSL enabled for https://${DOMAIN}"
