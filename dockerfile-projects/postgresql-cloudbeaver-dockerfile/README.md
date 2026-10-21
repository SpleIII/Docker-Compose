# PostgreSQL + CloudBeaver

CloudBeaver — веб-версия DBeaver. Здесь образ собирается **из собственного
Dockerfile**: в официальный `dbeaver/cloudbeaver` добавляется `curl`, чтобы
работал встроенный healthcheck.

---

## Состав стека

| Сервис | Образ | Порт | Роль |
|---|---|---|---|
| `db` | `postgres:17-alpine` | — | база данных |
| `cloudbeaver` | собирается из `Dockerfile` | `8979` → 8978 | веб-интерфейс |

Данные базы и воркспейс CloudBeaver лежат в томах `db_data` и
`cloudbeaver_workspace`. Сеть — `cloudbeaver-net`.

---

## Что делает Dockerfile

```dockerfile
FROM dbeaver/cloudbeaver:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8978

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:8978/ || exit 1
```

Официальный образ основан на Ubuntu и не содержит `curl` — без установки
healthcheck всегда будет падать. `start-period=60s` даёт приложению время на
старт, когда порт ещё не отвечает.

---

## Сборка и запуск

```bash
docker compose up -d --build
docker compose ps -a
```

> Флаг `--build` обязателен: без него Docker возьмёт готовый образ из
> реестра, а не соберёт ваш Dockerfile.

---

## Доступ

<http://localhost:8979>

При первом входе создаётся учётная запись администратора, после чего
открывается панель базовых настроек **Server Configuration**.

---

## Подключение к PostgreSQL

Добавьте подключение через **New Connection**:

| Настройка | Значение |
|---|---|
| Host | `db` |
| Port | `5432` |
| Database | `mydatabase` |
| User | `myuser` |
| Password | `mypassword` |

После сохранения в навигаторе появится подключение `PostgreSQL@db` с полным
доступом к таблицам и схеме базы.

---

## Управление

```bash
docker compose logs -f cloudbeaver
docker compose down --rmi all -v   # вместе с образом и томами
```

---

[← к списку стеков](../../README.md)
