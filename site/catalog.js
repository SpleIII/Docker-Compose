/* =========================================================
   Каталог стеков: единый источник данных для сайта.
   Держим в синхронизации с реальными compose.yaml.
   ========================================================= */

const STACKS = [
  {
    slug: 'joomla',
    title: 'Joomla',
    kind: 'ready',
    summary: 'CMS на PHP с базой MariaDB. Классика для блога или корпоративного сайта.',
    services: [
      {
        name: 'joomla',
        image: 'joomla:latest',
        ports: ['8082→80'],
        volumes: ['joomla_data'],
        networks: ['joomla-network'],
      },
      {
        name: 'db',
        image: 'mariadb:11.5.2',
        ports: [],
        volumes: ['db_data'],
        networks: ['joomla-network'],
      },
    ],
    networks: ['joomla-network'],
    volumes: ['db_data', 'joomla_data'],
  },

  {
    slug: 'wordpress',
    title: 'WordPress',
    kind: 'ready',
    summary: 'Самая популярная CMS в мире на PHP и MySQL 8.0.',
    services: [
      {
        name: 'wordpress',
        image: 'wordpress:latest',
        ports: ['8081→80'],
        volumes: ['wordpress_data'],
        networks: ['wp-network'],
      },
      {
        name: 'db',
        image: 'mysql:8.0',
        ports: [],
        volumes: ['db_data'],
        networks: ['wp-network'],
      },
    ],
    networks: ['wp-network'],
    volumes: ['db_data', 'wordpress_data'],
  },

  {
    slug: 'mysql-phpmyadmin',
    title: 'MySQL + phpMyAdmin',
    kind: 'ready',
    summary: 'СУБД и веб-панель управления к ней в одной сети.',
    services: [
      {
        name: 'mysql',
        image: 'mysql:8.0',
        ports: ['3306→3306'],
        volumes: ['mysql_data'],
        networks: ['mysql-pma-network'],
      },
      {
        name: 'phpmyadmin',
        image: 'phpmyadmin/phpmyadmin:latest',
        ports: ['8083→80'],
        volumes: [],
        networks: ['mysql-pma-network'],
      },
    ],
    networks: ['mysql-pma-network'],
    volumes: ['mysql_data'],
  },

  {
    slug: 'postgresql',
    title: 'PostgreSQL',
    kind: 'ready',
    summary: 'Один контейнер с healthcheck и скриптом первичной инициализации.',
    services: [
      {
        name: 'postgres',
        image: 'postgres:15',
        ports: ['5432→5432'],
        volumes: ['./data', './backups', './scripts/init.sql'],
        networks: [],
      },
    ],
    networks: [],
    volumes: [],
  },

  {
    slug: 'postgresql-pgadmin',
    title: 'PostgreSQL + pgAdmin',
    kind: 'ready',
    summary: 'PostgreSQL 17 на alpine и официальный веб-интерфейс pgAdmin 4.',
    services: [
      {
        name: 'postgres',
        image: 'postgres:17-alpine',
        ports: ['5432→5432'],
        volumes: ['postgres_data'],
        networks: [],
      },
      {
        name: 'pgadmin',
        image: 'dpage/pgadmin4:latest',
        ports: ['5050→80'],
        volumes: [],
        networks: [],
      },
    ],
    networks: [],
    volumes: ['postgres_data'],
  },

  {
    slug: 'drawdb',
    title: 'drawDB',
    kind: 'ready',
    summary: 'Браузерный редактор ER-диаграмм с экспортом в SQL.',
    services: [
      {
        name: 'drawdb',
        image: 'node:20-alpine',
        ports: ['5173→5173'],
        volumes: ['./ → /var/www/html'],
        networks: ['default'],
      },
    ],
    networks: ['default'],
    volumes: [],
  },

  {
    slug: 'libredb-studio',
    title: 'LibreDB Studio',
    kind: 'ready',
    summary: 'Веб-IDE для баз данных — браузерный аналог DataGrip и DBeaver.',
    services: [
      {
        name: 'libredb-studio',
        image: 'ghcr.io/libredb/libredb-studio:latest',
        ports: ['3000→3000'],
        volumes: ['libredb-data'],
        networks: [],
      },
    ],
    networks: [],
    volumes: ['libredb-data'],
  },

  {
    slug: 'homehub',
    title: 'Homehub',
    kind: 'ready',
    summary: 'Семейный дашборд: заметки, покупки, дела, расходы и файлы.',
    services: [
      {
        name: 'homehub',
        image: 'ghcr.io/surajverma/homehub:latest',
        ports: ['5000→5000'],
        volumes: ['./uploads', './media', './pdfs', './data', './config.yml'],
        networks: [],
      },
    ],
    networks: [],
    volumes: [],
  },

  {
    slug: 'cloudbeaver',
    title: 'CloudBeaver',
    kind: 'ready',
    summary: 'Веб-версия DBeaver: подключения, SQL-запросы и обзор схем.',
    services: [
      {
        name: 'cloudbeaver',
        image: 'dbeaver/cloudbeaver:latest',
        ports: ['8978→8978'],
        volumes: ['./workspace'],
        networks: [],
      },
    ],
    networks: [],
    volumes: [],
  },

  {
    slug: 'postgresql-adminer',
    title: 'PostgreSQL + Adminer',
    kind: 'build',
    path: 'dockerfile-projects/postgresql-adminer',
    summary: 'Adminer, собранный из Dockerfile: в образ добавлен драйвер php83-pgsql.',
    services: [
      {
        name: 'db',
        image: 'postgres:17-alpine',
        ports: [],
        volumes: ['db_data'],
        networks: ['adminer-net'],
      },
      {
        name: 'adminer',
        image: 'сборка из Dockerfile',
        ports: ['8080→8080'],
        volumes: [],
        networks: ['adminer-net'],
      },
    ],
    networks: ['adminer-net'],
    volumes: ['db_data'],
  },

  {
    slug: 'postgresql-cloudbeaver',
    title: 'PostgreSQL + CloudBeaver',
    kind: 'build',
    path: 'dockerfile-projects/postgresql-cloudbeaver-dockerfile',
    summary: 'CloudBeaver, собранный из Dockerfile: в образ добавлен curl для healthcheck.',
    services: [
      {
        name: 'db',
        image: 'postgres:17-alpine',
        ports: [],
        volumes: ['db_data'],
        networks: ['cloudbeaver-net'],
      },
      {
        name: 'cloudbeaver',
        image: 'сборка из Dockerfile',
        ports: ['8979→8978'],
        volumes: ['cloudbeaver_workspace'],
        networks: ['cloudbeaver-net'],
      },
    ],
    networks: ['cloudbeaver-net'],
    volumes: ['db_data', 'cloudbeaver_workspace'],
  },

  {
    slug: 'postgresql-pgadmin',
    title: 'PostgreSQL + pgAdmin',
    kind: 'build',
    path: 'dockerfile-projects/postgresql-pgadmin-dockerfile',
    summary: 'pgAdmin, собранный из Dockerfile: в образ добавлены wget и curl.',
    services: [
      {
        name: 'db',
        image: 'postgres:17-alpine',
        ports: [],
        volumes: ['db_data'],
        networks: ['pgadmin-net'],
      },
      {
        name: 'pgadmin',
        image: 'сборка из Dockerfile',
        ports: ['5051→80'],
        volumes: ['pgadmin_data'],
        networks: ['pgadmin-net'],
      },
    ],
    networks: ['pgadmin-net'],
    volumes: ['db_data', 'pgadmin_data'],
  },
];

if (typeof module !== 'undefined') {
  module.exports = { STACKS };
}
