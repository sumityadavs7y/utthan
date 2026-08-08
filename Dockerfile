FROM --platform=linux/amd64 node:21.4.0-bullseye-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl gosu \
  && rm -rf /var/lib/apt/lists/* \
  && gosu nobody true

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

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
