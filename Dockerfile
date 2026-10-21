# node:21.4.0-bullseye-slim could no longer build: Node 21 is EOL and that
# pinned bullseye image's apt index resolved curl/libcurl4 versions that have
# since been dropped from the Debian security pool (404 on apt-get install).
# A floating Node 22 LTS / bookworm tag is rebuilt with a fresh index, so the
# same trap does not re-arm.
FROM --platform=linux/amd64 node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl gosu \
  && rm -rf /var/lib/apt/lists/* \
  && gosu nobody true

COPY package.json package-lock.json ./
# Drop the npm cache in the same layer; the root volume is tight.
RUN npm ci --omit=dev --no-audit --no-fund \
  && npm cache clean --force

COPY . .

RUN mkdir -p public/uploads/blogs public/uploads/gallery public/uploads/team \
    public/uploads/campaigns public/uploads/certificates \
  && chown -R node:node /app \
  && chmod +x deploy/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["./deploy/docker-entrypoint.sh"]
CMD ["npm", "start"]
