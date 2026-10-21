# Проекты на Dockerfile

Три варианта одного и того же PostgreSQL 17, где веб-интерфейс собирается из
собственного `Dockerfile`. Задача лабораторной работы — доработать официальные
образы так, чтобы они получили недостающие системные утилиты и рабочий
`HEALTHCHECK`.

---

## Состав

| # | Проект | Веб-интерфейс | Порт |
|:-:|---|---|---|
| 1 | [`postgresql-adminer`](postgresql-adminer/) | Adminer + драйвер `php83-pgsql` | `8080` |
| 2 | [`postgresql-pgadmin-dockerfile`](postgresql-pgadmin-dockerfile/) | pgAdmin 4 + `wget` и `curl` | `5051` |
| 3 | [`postgresql-cloudbeaver-dockerfile`](postgresql-cloudbeaver-dockerfile/) | CloudBeaver + `curl` | `8979` |

Во всех трёх к базе подключается PostgreSQL 17 на alpine-образе, общий доступ —
`myuser` / `mypassword`, база — `mydatabase`.

---

## Запуск

```bash
cd <имя-проекта>
docker compose up -d --build
```

> `--build` обязателен: без него Docker возьмёт готовый образ из реестра, а не
> соберёт ваш Dockerfile.

Проверить, что контейнеры дошли до состояния `healthy`:

```bash
docker compose ps -a
```

---

## Остановка и очистка

```bash
docker compose down                  # контейнеры и сети
docker compose down --rmi all -v     # плюс локальные образы и тома
```

---

## Структура

```text
dockerfile-projects/
├── postgresql-adminer/
│   ├── Dockerfile
│   ├── compose.yaml
│   └── README.md
├── postgresql-pgadmin-dockerfile/
│   ├── Dockerfile
│   ├── compose.yaml
│   └── README.md
└── postgresql-cloudbeaver-dockerfile/
    ├── Dockerfile
    ├── compose.yaml
    └── README.md
```

---

[← к списку стеков](../README.md)
