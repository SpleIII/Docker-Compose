#!/usr/bin/env node
/* =========================================================
   Сверка каталога сайта с настоящими compose-файлами.
   Запускается в CI: если стек разошёлся с site/catalog.js —
   падаем с ненулевым кодом выхода.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const { STACKS } = require('../site/catalog.js');

const ROOT = path.resolve(__dirname, '..');

/* ---------- минимальный разбор compose.yaml ---------- */

const parseCompose = (file) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const services = [];

  let inServices = false;
  let current = null;
  let inPorts = false;

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) {
      continue;
    }

    const indent = raw.length - raw.trimStart().length;
    const text = raw.trim();

    if (indent === 0) {
      inServices = text === 'services:';
      inPorts = false;
      current = null;
      continue;
    }

    if (!inServices) {
      continue;
    }

    // Заголовок сервиса — ровно два отступа.
    if (indent === 2 && text.endsWith(':')) {
      current = { name: text.slice(0, -1), image: null, build: false, ports: [] };
      services.push(current);
      inPorts = false;
      continue;
    }

    if (!current) {
      continue;
    }

    if (indent === 4) {
      inPorts = false;

      if (text.startsWith('image:')) {
        current.image = text.slice('image:'.length).trim();
      } else if (text.startsWith('build:')) {
        current.build = true;
      } else if (text === 'ports:') {
        inPorts = true;
      }
      continue;
    }

    // Список портов.
    if (inPorts && indent >= 6 && text.startsWith('-')) {
      const value = text.replace(/^-\s*/, '').replace(/["']/g, '').trim();
      if (value) {
        current.ports.push(value);
      }
    }
  }

  return services;
};

/* ---------- сверка ---------- */

const problems = [];
const normalizePort = (value) => value.split('→')[0].split(':')[0].trim();

STACKS.forEach((stack) => {
  const composePath = path.join(ROOT, stack.path || stack.slug, 'compose.yaml');

  if (!fs.existsSync(composePath)) {
    problems.push(`${stack.slug}: нет файла ${stack.path || stack.slug}/compose.yaml`);
    return;
  }

  const services = parseCompose(composePath);

  // 1. Набор сервисов должен совпадать.
  const composeNames = services.map((svc) => svc.name).sort();
  const catalogNames = stack.services.map((svc) => svc.name).sort();

  if (composeNames.join(',') !== catalogNames.join(',')) {
    problems.push(
      `${stack.slug}: сервисы в compose — [${composeNames.join(', ')}], в каталоге — [${catalogNames.join(', ')}]`
    );
    return;
  }

  // 2. Образы и порты каждого сервиса.
  services.forEach((svc) => {
    const entry = stack.services.find((item) => item.name === svc.name);

    const composeImage = svc.build ? null : svc.image;
    const catalogImage = entry.image.includes('Dockerfile') ? null : entry.image;

    if (composeImage !== catalogImage) {
      problems.push(
        `${stack.slug}/${svc.name}: образ в compose — ${composeImage || 'сборка'}, в каталоге — ${catalogImage || 'сборка'}`
      );
    }

    const composePorts = svc.ports.map(normalizePort).sort();
    const catalogPorts = entry.ports.map(normalizePort).sort();

    if (composePorts.join(',') !== catalogPorts.join(',')) {
      problems.push(
        `${stack.slug}/${svc.name}: порты в compose — [${composePorts.join(', ')}], в каталоге — [${catalogPorts.join(', ')}]`
      );
    }
  });
});

if (problems.length) {
  console.error('❌ Каталог сайта разошёлся с compose-файлами:\n');
  problems.forEach((line) => console.error(`  • ${line}`));
  process.exit(1);
}

console.log(`✅ Каталог согласован с compose-файлами: ${STACKS.length} стеков`);
