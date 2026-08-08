# Production deploy (EC2 + Docker Compose + GitHub Actions)

Push/merge to `main` triggers [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml), which SSHs to the EC2 host, syncs the app to `/opt/utthan`, writes `.env`, and runs `docker compose up -d --build`.

Data persists in Docker named volumes (`postgres_data`, `uploads_data`) even if containers are removed.

## GitHub Environment: `production`

Create a repository Environment named **`production`**, then add:

### Secrets

| Name | Value |
|------|--------|
| `EC2_HOST` | `13.204.138.100` (or your instance public IP) |
| `EC2_USER` | `ubuntu` (Ubuntu AMI) or `ec2-user` (Amazon Linux) |
| `EC2_SSH_PRIVATE_KEY` | Full PEM contents (`-----BEGIN ... PRIVATE KEY-----` through `END`) |
| `DB_PASSWORD` | Strong Postgres password |
| `SESSION_SECRET` | Long random string |
| `ADMIN_PASSWORD` | Strong admin password |

### Variables

| Name | Suggested value |
|------|-----------------|
| `EC2_APP_DIR` | `/opt/utthan` |
| `DB_NAME` | `utthan` |
| `DB_USER` | `utthanuser` |
| `ADMIN_EMAIL` | `admin@utthan.org` |
| `SITE_URL` | `https://utthanfoundation.in` |

Do **not** store a personal GitHub PAT for this deploy flow. Checkout uses the workflow `GITHUB_TOKEN`.

## EC2 security group

- **22** — SSH (prefer your IP only)
- **80** — HTTP
- **443** — HTTPS (needed after SSL)

## After DNS points to this EC2

```bash
ssh -i UtthanFoundation.pem ubuntu@13.204.138.100
cd /opt/utthan
./deploy/enable-ssl.sh
```

That issues a Let's Encrypt cert for `utthanfoundation.in` + `www`, switches Nginx to [`default.ssl.conf`](nginx/default.ssl.conf), writes `deploy/nginx/.ssl-enabled`, and installs a renew cron. Later deploys detect `.ssl-enabled` and keep HTTPS config.

## Watchdog

`deploy/bootstrap.sh` installs a cron job every 5 minutes that runs `deploy/watchdog.sh` to bring containers back up if they stop or become unhealthy.

## Manual deploy

```bash
# from repo root, after secrets exist on the server .env
rsync -az --exclude node_modules --exclude .git --exclude .env ./ ubuntu@HOST:/opt/utthan/
ssh ubuntu@HOST 'cd /opt/utthan && ./deploy/bootstrap.sh && docker compose -p utthan up -d --build'
```
