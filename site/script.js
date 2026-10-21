/* =========================================================
   Compose Studio — рендер каталога, схем и карты портов.
   Ванильный JavaScript, без сборки и зависимостей.
   ========================================================= */

(() => {
  'use strict';

  const THEME_KEY = 'compose-studio-theme';

  const els = {
    catalog: document.querySelector('[data-catalog]'),
    count: document.querySelector('[data-count]'),
    search: document.querySelector('[data-search]'),
    canvas: document.querySelector('[data-schema-canvas]'),
    name: document.querySelector('[data-schema-name]'),
    kind: document.querySelector('[data-schema-kind]'),
    cmd: document.querySelector('[data-schema-cmd]'),
    copy: document.querySelector('[data-copy-cmd]'),
    meta: document.querySelector('[data-schema-meta]'),
    ports: document.querySelector('[data-ports]'),
  };

  /* ---------------------------------------------------------
     Тема
     --------------------------------------------------------- */

  const initTheme = () => {
    const root = document.documentElement;
    const toggle = document.querySelector('[data-theme-toggle]');
    const label = document.querySelector('[data-theme-label]');

    const apply = (theme) => {
      root.dataset.theme = theme;
      if (label) {
        label.textContent = theme === 'dark' ? 'Тёмная' : 'Светлая';
      }
    };

    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    apply(localStorage.getItem(THEME_KEY) || preferred);

    toggle?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(THEME_KEY, next);
      renderSchema(current);
    });
  };

  /* ---------------------------------------------------------
     Вспомогательное
     --------------------------------------------------------- */

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[ch]);

  const pathOf = (stack) => stack.path || stack.slug;

  const runCommand = (stack) =>
    `cd ${pathOf(stack)} && docker compose up -d${stack.kind === 'build' ? ' --build' : ''}`;

  const themeVars = () => {
    const style = getComputedStyle(document.documentElement);
    const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
      ink: read('--ink', '#0f1728'),
      soft: read('--ink-soft', '#5b6880'),
      faint: read('--ink-faint', '#8c98ad'),
      line: read('--line', 'rgba(15,23,40,0.11)'),
      lineStrong: read('--line-strong', 'rgba(15,23,40,0.24)'),
      accent: read('--accent', '#1d63ed'),
      accentSoft: read('--accent-soft', 'rgba(29,99,237,0.09)'),
      card: read('--card', '#ffffff'),
      paper: read('--paper', '#f3f6fc'),
    };
  };

  /* ---------------------------------------------------------
     Каталог карточек
     --------------------------------------------------------- */

  const renderCatalog = (list) => {
    els.catalog.innerHTML = list
      .map((stack) => {
        const services = stack.services
          .map(
            (svc) => `
              <div class="svc">
                <span class="svc__name">${escapeHtml(svc.name)}</span>
                <span class="svc__image">${escapeHtml(svc.image)}</span>
              </div>`
          )
          .join('');

        const ports = stack.services.flatMap((svc) => svc.ports);
        const chips = ports.length
          ? ports.map((p) => `<span class="chip">${escapeHtml(p)}</span>`).join('')
          : '<span class="chip chip--muted">без внешних портов</span>';

        const kindLabel = stack.kind === 'build' ? 'Dockerfile' : 'готовый образ';
        const kindClass = stack.kind === 'build' ? 'card__kind card__kind--build' : 'card__kind';

        return `
          <article class="card" data-slug="${escapeHtml(stack.slug)}" tabindex="0" role="button">
            <div class="card__top">
              <h3 class="card__title">${escapeHtml(stack.title)}</h3>
              <span class="${kindClass}">${kindLabel}</span>
            </div>
            <p class="card__summary">${escapeHtml(stack.summary)}</p>
            <div class="card__services">${services}</div>
            <div class="card__ports">${chips}</div>
          </article>`;
      })
      .join('');

    els.count.textContent = String(list.length);
  };

  /* ---------------------------------------------------------
     SVG-схема стека
     --------------------------------------------------------- */

  const BOX_W = 236;
  const BOX_H = 78;
  const GAP = 62;

  const renderSchema = (stack) => {
    if (!stack || !els.canvas) {
      return;
    }

    const c = themeVars();
    const services = stack.services;
    const hasNetwork = stack.networks.length > 0;

    const innerW = services.length * BOX_W + (services.length - 1) * GAP;
    const width = innerW + 88;
    const height = 262;

    const parts = [];
    parts.push(
      `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема стека ${escapeHtml(stack.title)}">`
    );

    // Граница сети.
    if (hasNetwork) {
      parts.push(
        `<rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="18" fill="none" stroke="${c.lineStrong}" stroke-dasharray="7 6" stroke-width="1.5"/>`
      );
      parts.push(
        `<text x="30" y="36" font-family="ui-monospace, monospace" font-size="11" letter-spacing="1.4" fill="${c.faint}">СЕТЬ · ${escapeHtml(stack.networks.join(', '))}</text>`
      );
    }

    services.forEach((svc, index) => {
      const x = 44 + index * (BOX_W + GAP);
      const y = 100;
      const centerX = x + BOX_W / 2;

      parts.push(`<g transform="translate(${x}, ${y})">`);

      // Порты — выноски над блоком.
      svc.ports.forEach((port, portIndex) => {
        const chipW = Math.max(74, port.length * 8 + 22);
        const chipX = centerX - x - chipW / 2;
        const chipY = -42 + portIndex * 32;

        parts.push(
          `<line x1="${centerX - x}" y1="${chipY + 26}" x2="${centerX - x}" y2="-14" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="4 4"/>`
        );
        parts.push(
          `<rect x="${chipX}" y="${chipY}" width="${chipW}" height="26" rx="7" fill="${c.accentSoft}" stroke="${c.accent}" stroke-width="1"/>`
        );
        parts.push(
          `<text x="${centerX - x}" y="${chipY + 17}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11.5" fill="${c.accent}">${escapeHtml(port)}</text>`
        );
      });

      // Блок сервиса.
      parts.push(
        `<rect x="0" y="0" width="${BOX_W}" height="${BOX_H}" rx="11" fill="${c.card}" stroke="${c.line}" stroke-width="1.4"/>`
      );
      parts.push(
        `<path d="M 11 1.6 h ${BOX_W - 22}" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>`
      );
      parts.push(
        `<text x="16" y="38" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="${c.ink}">${escapeHtml(svc.name)}</text>`
      );
      parts.push(
        `<text x="16" y="59" font-family="ui-monospace, monospace" font-size="11.5" fill="${c.faint}">${escapeHtml(svc.image)}</text>`
      );

      // Тома — под блоком.
      svc.volumes.forEach((volume, volumeIndex) => {
        const label = `▤ ${volume}`;
        const chipW = label.length * 7.4 + 20;
        const chipY = BOX_H + 26 + volumeIndex * 30;

        parts.push(
          `<line x1="16" y1="${BOX_H}" x2="16" y2="${chipY}" stroke="${c.faint}" stroke-width="1" stroke-dasharray="3 3"/>`
        );
        parts.push(
          `<rect x="4" y="${chipY}" width="${chipW}" height="24" rx="6" fill="${c.paper}" stroke="${c.line}" stroke-width="1"/>`
        );
        parts.push(
          `<text x="${4 + chipW / 2}" y="${chipY + 16}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="${c.soft}">${escapeHtml(label)}</text>`
        );
      });

      parts.push('</g>');
    });

    parts.push('</svg>');
    els.canvas.innerHTML = parts.join('');
  };

  /* ---------------------------------------------------------
     Метаданные схемы
     --------------------------------------------------------- */

  const renderMeta = (stack) => {
    const images = stack.services.map((svc) => svc.image);
    const rows = [
      ['Путь', pathOf(stack)],
      ['Образы', images.join(', ')],
      ['Сети', stack.networks.join(', ')],
      ['Тома', stack.volumes.join(', ')],
    ];

    els.meta.innerHTML = rows
      .map(
        ([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd class="${value ? '' : 'is-empty'}">${value ? escapeHtml(value) : 'не используются'}</dd>
          </div>`
      )
      .join('');
  };

  /* ---------------------------------------------------------
     Карта портов
     --------------------------------------------------------- */

  const renderPorts = () => {
    const rows = [];

    STACKS.forEach((stack) => {
      stack.services.forEach((svc) => {
        svc.ports.forEach((port) => {
          const host = port.split('→')[0];
          rows.push(`
            <tr>
              <td class="port">${escapeHtml(host)}</td>
              <td class="svc-name">${escapeHtml(svc.name)}</td>
              <td><a href="#catalog" data-goto="${escapeHtml(stack.slug)}">${escapeHtml(stack.title)}</a></td>
              <td><a href="http://localhost:${escapeHtml(host)}" target="_blank" rel="noreferrer">http://localhost:${escapeHtml(host)}</a></td>
            </tr>`);
        });
      });
    });

    rows.sort((a, b) => Number(a.match(/>(\d+)</)[1]) - Number(b.match(/>(\d+)</)[1]));
    els.ports.innerHTML = rows.join('');
  };

  /* ---------------------------------------------------------
     Выбор стека, поиск, копирование
     --------------------------------------------------------- */

  let current = STACKS[0];

  const selectStack = (slug) => {
    const stack = STACKS.find((item) => item.slug === slug);
    if (!stack) {
      return;
    }

    current = stack;
    els.name.textContent = stack.title;
    els.kind.textContent = stack.kind === 'build' ? 'сборка из Dockerfile' : 'готовые образы';
    els.cmd.textContent = runCommand(stack);

    renderSchema(stack);
    renderMeta(stack);

    document.querySelectorAll('.card').forEach((card) => {
      card.classList.toggle('is-active', card.dataset.slug === slug);
    });
  };

  const initCatalog = () => {
    renderCatalog(STACKS);

    els.catalog.addEventListener('click', (event) => {
      const card = event.target.closest('.card');
      if (card) {
        selectStack(card.dataset.slug);
        document.querySelector('#schema').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    els.catalog.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const card = event.target.closest('.card');
      if (card) {
        event.preventDefault();
        selectStack(card.dataset.slug);
      }
    });

    els.search.addEventListener('input', () => {
      const query = els.search.value.trim().toLowerCase();

      const filtered = STACKS.filter((stack) => {
        if (!query) {
          return true;
        }
        const haystack = [
          stack.title,
          stack.slug,
          stack.summary,
          ...stack.services.flatMap((svc) => [svc.name, svc.image, ...svc.ports]),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });

      renderCatalog(filtered);

      if (filtered.length && !filtered.some((stack) => stack.slug === current.slug)) {
        selectStack(filtered[0].slug);
      }
    });

    document.querySelectorAll('[data-goto]').forEach((link) => {
      link.addEventListener('click', () => {
        selectStack(link.dataset.goto);
        document.querySelector('#schema').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const initCopy = () => {
    const copy = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const done = document.execCommand('copy');
        helper.remove();
        return done;
      }
    };

    els.copy.addEventListener('click', async () => {
      const ok = await copy(els.cmd.textContent.trim());
      els.copy.textContent = ok ? 'скопировано' : 'не вышло';
      els.copy.disabled = true;
      window.setTimeout(() => {
        els.copy.textContent = els.copy.dataset.label || 'копировать';
        els.copy.disabled = false;
      }, 1600);
    });
  };

  /* ---------------------------------------------------------
     Подсветка активного раздела
     --------------------------------------------------------- */

  const initNav = () => {
    const links = Array.from(document.querySelectorAll('.nav a'));
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    if (!links.length || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          links.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /* ---------------------------------------------------------
     Запуск
     --------------------------------------------------------- */

  initTheme();
  initCatalog();
  initCopy();
  initNav();
  renderPorts();
  selectStack(current.slug);
})();
