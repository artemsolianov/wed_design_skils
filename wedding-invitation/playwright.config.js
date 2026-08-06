// @ts-check
const { defineConfig } = require('@playwright/test');

// Этот проект пингует @playwright/test последней версии (npm resolves ^1.55
// на 1.62+), а предустановленный в этой среде браузер — более старая сборка
// Chromium (ревизия 1194 вместо ожидаемых 1234). Не даём Playwright пытаться
// скачать недостающую ревизию — явно указываем путь на уже установленный
// бинарник. См. /root/.ccr/README.md в этой среде для контекста.
const CHROMIUM_PATH = '/opt/pw-browsers/chromium';

module.exports = defineConfig({
  testDir: './tests',

  // Скриншоты для визуальной регрессии зависят от рендера шрифтов/сглаживания
  // конкретной платформы — держим тесты внутри одного окружения (см.
  // предупреждение в доке Playwright про toHaveScreenshot).
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }]],

  // Один воркер — среда, где это запускается, гоняет контейнер от root, и
  // параллельный запуск двух Chromium-процессов без песочницы (см. ниже)
  // время от времени ловил гонку на старте зиготы: один воркер стартовал
  // нормально, другой падал с "Target page, context or browser has been
  // closed" ещё до первого теста. Один воркер — надёжнее, чем гнаться за
  // скоростью на 30 тестах.
  workers: 1,

  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: CHROMIUM_PATH,
      // Контейнер этой среды запускает всё от root — Chromium отказывается
      // стартовать без явного --no-sandbox в таком случае (реальный, а не
      // гипотетический сбой: см. zygote_host_impl_linux.cc:101 в логе).
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },

  expect: {
    // Небольшая терпимость к сглаживанию шрифтов между прогонами — не 0,
    // но и не настолько большая, чтобы пропустить реальную регрессию.
    toHaveScreenshot: { maxDiffPixelRatio: 0.015 },
  },

  projects: [
    {
      name: 'mobile',
      // Not devices['iPhone 13'] — its isMobile:true / hasTouch:true CDP
      // mobile-emulation path hung on launch against the older Chromium
      // build pinned above (browser process started, printed nothing but
      // routine dbus/upower noise, then Playwright's connection attempt
      // timed out and killed it — every test in the project failed
      // instantly afterward, reusing the one dead launch). A plain phone
      // viewport still exercises every breakpoint this project's CSS
      // actually branches on; it just skips real touch-event emulation.
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
});
