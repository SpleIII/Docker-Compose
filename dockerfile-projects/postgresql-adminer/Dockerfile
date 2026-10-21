FROM adminer:latest

USER root

# Устанавливаем драйвер PostgreSQL для Adminer
RUN apk add --no-cache php83-pgsql || true

USER adminer

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --spider -q http://localhost:8080 || exit 1
