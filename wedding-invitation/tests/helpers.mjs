// Общие хелперы для тестов сайта-приглашения.

// Карта грузится внешним скриптом Яндекса. В тестах глушим его: детерминизм
// важнее — не хотим, чтобы прохождение теста зависело от доступности сети
// и от того, успеет ли внешний виджет прогрузиться за отведённое время
// (см. best-practices Playwright: "Avoid testing third-party dependencies").
export async function blockExternalMap(page) {
  await page.route('**/api-maps.yandex.ru/**', (route) => route.abort());
}

// .reveal элементы появляются через IntersectionObserver — снимок или
// проверка до прокрутки поймает их в состоянии opacity:0. Прокручиваем
// до конца документа мелкими шагами (а не одним прыжком), чтобы каждая
// секция реально пересекла viewport и наблюдатель успел сработать.
// Ждём загрузки веб-шрифтов перед скриншотом — иначе первый снимок в
// прогоне может поймать системный фолбэк-шрифт вместо Alegreya/PT Sans
// и разойтись с последующими прогонами (флейки без реальной регрессии).
export async function waitForFonts(page) {
  await page.evaluate(() => document.fonts.ready);
}

export async function revealEverything(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight * 0.8);
    let y = 0;
    const max = document.documentElement.scrollHeight;
    while (y < max) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
      y += step;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    // .reveal's own CSS transition is 700ms (style.css). The elements
    // revealed by this final scroll only started fading in *now* — 200ms
    // here caught them mid-transition and axe measured a blended,
    // partially-transparent color as a false contrast violation (looked
    // like several real bugs, was actually one timing bug). 1000ms clears
    // 700ms with margin.
    await new Promise((r) => setTimeout(r, 1000));
  });
}
