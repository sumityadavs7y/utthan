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
  apply_ssl_nginx
  # Recreate so bind-mounted default.conf picks up a replaced inode.
  ${COMPOSE} up -d --force-recreate nginx
  ${COMPOSE} exec -T nginx nginx -t
  echo "==> Nginx HTTPS config restored for ${DOMAIN}"
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
