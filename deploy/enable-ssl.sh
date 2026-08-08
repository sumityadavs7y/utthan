#!/usr/bin/env bash
# Run on the EC2 host AFTER DNS for utthanfoundation.in (+ www) points here
# and security group allows 80/443.
#
#   cd /opt/utthan && ./deploy/enable-ssl.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/utthan}"
DOMAIN="${DOMAIN:-utthanfoundation.in}"
EMAIL="${CERTBOT_EMAIL:-admin@utthan.org}"
PROJECT_NAME="utthan"
COMPOSE="docker compose -f ${APP_DIR}/docker-compose.yml -p ${PROJECT_NAME}"
NGINX_ONLY="${1:-}"

cd "${APP_DIR}"

if [[ ! -f docker-compose.yml ]]; then
  echo "ERROR: ${APP_DIR}/docker-compose.yml not found"
  exit 1
fi

apply_ssl_nginx() {
  cp "${APP_DIR}/deploy/nginx/default.ssl.conf" "${APP_DIR}/deploy/nginx/default.conf"
  touch "${APP_DIR}/deploy/nginx/.ssl-enabled"
}

if [[ "${NGINX_ONLY}" == "--nginx-only" ]]; then
  echo "==> Restoring HTTPS nginx config (certs already issued)"
  apply_ssl_nginx
  ${COMPOSE} up -d nginx
  ${COMPOSE} exec -T nginx nginx -t
  ${COMPOSE} exec -T nginx nginx -s reload
  echo "==> Nginx HTTPS config restored"
  exit 0
fi

# Ensure stack (and ACME webroot volume) is up
${COMPOSE} up -d

echo "==> Requesting Let's Encrypt certificate for ${DOMAIN} and www.${DOMAIN}"
docker run --rm \
  -v "${PROJECT_NAME}_certbot_www:/var/www/certbot" \
  -v "${PROJECT_NAME}_certbot_certs:/etc/letsencrypt" \
  certbot/certbot certonly \
    --webroot -w /var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --keep-until-expiry \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

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
${COMPOSE} up -d nginx
${COMPOSE} exec -T nginx nginx -t
${COMPOSE} exec -T nginx nginx -s reload

CRON_LINE="0 3,15 * * * cd ${APP_DIR} && docker run --rm -v ${PROJECT_NAME}_certbot_www:/var/www/certbot -v ${PROJECT_NAME}_certbot_certs:/etc/letsencrypt certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker compose -p ${PROJECT_NAME} exec -T nginx nginx -s reload >> /var/log/utthan-certbot.log 2>&1"
TMP_CRON="$(mktemp)"
(crontab -l 2>/dev/null || true) | grep -v 'utthan-certbot\|certbot renew' > "${TMP_CRON}" || true
echo "${CRON_LINE}" >> "${TMP_CRON}"
crontab "${TMP_CRON}"
rm -f "${TMP_CRON}"

echo "==> SSL enabled for https://${DOMAIN}"
