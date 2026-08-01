# INFRA_STATUS.md — healthaiatlas frontend (fact-checked 2026-07-31)

> Единый источник правды про инфру фронта. Читать агентам (Гермес/Арсений/Марк/Артём/Уна)
> перед любым поднятием/верификацией фронта. Не верь устаревшим заметкам «нет браузера» и т.п.

Проект: Vite + React 18 SPA (НЕ Next.js). Путь: `~/atlas-front-build` (native ext4 copy
оригинала `/mnt/d/projects/03_products/healthaiatlas/frontend` — копия для быстрого dev,
правки делай в оригинале + git). Живой сайт: https://healthaiatlas.com/.
Страница БД-грантов: `/open-calls-db` (рендерит 92 гранта из `src/data/openCallEntries.db.ts`,
сгенерированного из `db/atlas.sqlite`).

---

## 1. КАК ПОДНЯТЬ ФРОНТ (одна команда, без копания)

### Самый быстрый путь — гейт-скрипт (no-LLM, один вызов):
```bash
KEEP_SERVER=1 PORT=8080 bash ~/.hermes/scripts/frontend-bringup-gate.sh ~/atlas-front-build /open-calls-db
```
Выхлоп: `GATE: OK port=8080 http=200 title="..." console_errors=0 boot=32s`
Сервер остаётся жив (pid в выхлопе). Гасить: `kill <pid>`.

### Или вручную (если гейт недоступен):
```bash
cd ~/atlas-front-build
bash start-dev.sh          # ставит deps (если vite нет) + NODE_ENV=development npm run dev
# сервер на http://localhost:8080
```
`.npmrc` в проекте уже отменяет глобальный `omit=dev` (см. ловушку №1).

### Скриншот для Марка/Артёма (on-demand «покажи /open-calls-db», 1440px desktop):
```bash
bash ~/.hermes/scripts/atlas-screenshot.sh /open-calls-db
# → /tmp/atlas-open-calls-db.png (1440px desktop), путь печатается в stdout
```
Сервер должен быть поднят (KEEP_SERVER=1 из гейта, либо `bash start-dev.sh`).
Скрипт сам делает headless-chrome --screenshot. PNG отдавать агентам/Кейт (агент не видит).

---

## 2. БРАУЗЕР — как верифицировать (DO / DON'T)

### DO
- ✅ Headless Chrome CLI: `google-chrome-stable --headless=new --no-sandbox --disable-gpu --virtual-time-budget=8000 --screenshot=/tmp/atlas.png http://localhost:8080/open-calls-db`
  → PNG для Марка/Артёма/Кейт (агент сам не видит — `vision_analyze`=404).
- ✅ Playwright (системный chrome): `executablePath: '/usr/bin/google-chrome-stable'` — НЕ бандл
  headless-shell (версии рассинхронятся → goto fails).
- ✅ DOM-маркеры через playwright: ждать текст `Total tracked` (==92) на /open-calls-db.

### DON'T
- ❌ `browser_navigate` / `browser_*` тул Hermes через CDP = 404 (баг тула, не «нет браузера»).
- ❌ `google-chrome-stable --dump-dom` на этот SPA = ВИСНЕТ (тяжёлый react-query/AuthProvider,
  гидрация не завершается в virtual-time-budget). Используй playwright с ожиданием текста.
- ❌ `vision_analyze` = 404 — верификация = маркеры + PNG для людей.

---

## 3. ЛОВУШКИ (на них убили ~40 мин 2026-07-31 — больше не наступать)

1. **`npm config omit=dev` (ГЛОБАЛЬНО)** тихо пропускает ВСЕ devDependencies → `vite`,
   `@vitejs/plugin-react-swc`, `typescript` не ставятся, но npm врёт «added/up to date».
   Фикс: проектный `.npmrc` с `omit=` (уже есть) ИЛИ `npm install --include=dev`.
   Проверка: `npm config get omit` в папке проекта должен быть пустым.
2. **`NODE_ENV=production` в окружении** ломает vite dev (`_jsxDEV is not a function`).
   Фикс: запуск `NODE_ENV=development npm run dev` (start-dev.sh и гейт это делают).
3. **Рассинхрон node_modules ↔ lock**: npm может сказать «up to date», но файлов нет
   (прерванный install). Фикс: `rm -rf node_modules package-lock.json && npm install`.
4. **Тип `CountdownStatus.date`**: `src/lib/countdown.ts` ждёт `date: Date`, а
   `openCallEntries.db.ts` (из БД) даёт `date: string` (ISO). Уже починено в countdown.ts
   (`new Date(status.date)`). Не откатывать на `Date` без конвертации.
5. **Импорт `openCallEntriesDb`** идёт из `@/data/openCallEntries.db` (с точкой .db),
   не из `@/data/openCallEntries`.

---

## 4. ВЕРИФИКАЦИЯ ДЛЯ АГЕНТОВ (кто что проверяет)

- **Арсений (arseniy)** — валидация кода: гейт `bash scripts/validate.sh` (lockfile sync →
  vite binary → `tsc -b --noEmit` → `vitest run`; опц. `--boot` для smoke NODE_ENV-регрессии)
  перед апрувом. Запускать headless, живой сервер не обязателен.
  ВНИМАНИЕ: `tsc -b` падает на `src/components/home/SubscribeSection.tsx` (синтаксис, строки
  ~105-110) — ПРЕ-СУЩЕСТВУЮЩИЙ баг, НЕ в задаче /open-calls-db. Править отдельно.
- **Марк (marketer) + Артём (artem)** — НЕ нужен живой сервер, только скриншот от Гермеса
  через `bash ~/.hermes/scripts/atlas-screenshot.sh /open-calls-db` (1440px desktop PNG).
  Держать vite ради них = лишняя нагрузка. Visual-watchdog (cron diff PNG) — опционально.
- **Уна (una)** — фронт НЕ нужен: данные из `db/atlas.sqlite` (канонично), фронт = статик-рендер.
  Сверку opportunities↔open-calls делать на уровне БД (`reconcile_opportunities.py`, read-only),
  не трогать курируемый `openCallEntries.ts`.
- **Ренат (renat)** — `frontend-bringup-gate.sh` + `atlas-front-health.sh` (cron 6h, молчит на OK)
  убирают 10 итераций агента → 1 вызов. Экономия ~80-90% токенов.

---

## 5. КОМУ ЧТО (профили Hermes, НЕ люди)
Все «участники» — агенты-профили, не люди. Реальный человек в переписке = только Кейт.
- 🦅 Гермес — оркестратор/исполнитель, верификация через гейт/headless.
- ⚙️ Арсений — валидация кода до Кейт.
- 🎨 Артём — виз.куратор (смотрит PNG, не генерит).
- 📣 Марк — маркетинг/перф (смотрит PNG).
- 🌟 Уна — гранты/возможности (данные из БД).
- 💰 Ренат — стоимость LLM (гейт-автоматизация).
Доставка `telegram` = только Кейт.
