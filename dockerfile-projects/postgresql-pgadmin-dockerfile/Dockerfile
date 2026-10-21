FROM dpage/pgadmin4:latest

USER root

RUN apk add --no-cache wget curl || true

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --spider -q http://localhost:80/misc/ping || exit 1
