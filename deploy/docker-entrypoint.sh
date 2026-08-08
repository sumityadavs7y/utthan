#!/bin/sh
set -eu

UPLOADS=/app/public/uploads
mkdir -p \
  "$UPLOADS/blogs" \
  "$UPLOADS/gallery" \
  "$UPLOADS/team" \
  "$UPLOADS/campaigns" \
  "$UPLOADS/certificates"

# Named volumes are often root-owned on first mount; app runs as node.
chown -R node:node "$UPLOADS"

exec gosu node "$@"
