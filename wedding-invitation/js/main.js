/* ==========================================================================
   Артём & Юлия — сайт-приглашение
   Ванильный JS без зависимостей. Прогрессивное улучшение: без JS сайт
   остаётся читаемым, ссылки работают, дата видна в <noscript>.
   ========================================================================== */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Шапка: фон при скролле ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Мобильное меню ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      menuToggle.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Плавающая кнопка RSVP на мобильных ---------- */
  const floatingRsvp = document.querySelector(".floating-rsvp");
  const rsvpSection = document.getElementById("rsvp");
  if (floatingRsvp && rsvpSection) {
    const heroEl = document.querySelector(".hero");
    const io = new IntersectionObserver(
      ([entry]) => {
        floatingRsvp.classList.toggle("is-visible", !entry.isIntersecting);
      },
      { rootMargin: "0px 0px -60% 0px" }
    );
    if (heroEl) io.observe(heroEl);

    const ioHideAtForm = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) floatingRsvp.classList.remove("is-visible");
      },
      { threshold: 0.2 }
    );
    ioHideAtForm.observe(rsvpSection);
  }

  /* ---------- Скролл-реявл ----------
     Сознательно не полагаемся только на IntersectionObserver: при быстрой
     программной/анимированной прокрутке (в т.ч. переходах по якорным
     ссылкам с CSS scroll-behavior:smooth через несколько секций) браузер
     может не выдать промежуточное пересечение, и блок останется скрытым
     навсегда. Поэтому дополнительно подстраховываемся собственной
     проверкой положения элементов по scroll/resize — это чуть менее
     элегантно, зато гарантированно работает на любом устройстве и при
     любом способе прокрутки. */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      });

      let pending = revealEls.slice();

      const sweep = () => {
        if (!pending.length) return;
        const viewH = window.innerHeight;
        const stillPending = [];
        for (const el of pending) {
          const rect = el.getBoundingClientRect();
          if (rect.top < viewH * 0.92 && rect.bottom > 0) {
            el.classList.add("is-visible");
          } else {
            stillPending.push(el);
          }
        }
        pending = stillPending;
        if (!pending.length) {
          window.removeEventListener("scroll", onScrollThrottled);
          window.removeEventListener("resize", onScrollThrottled);
        }
      };

      let ticking = false;
      const onScrollThrottled = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          sweep();
          ticking = false;
        });
      };

      sweep(); // элементы, уже видимые при загрузке
      window.addEventListener("scroll", onScrollThrottled, { passive: true });
      window.addEventListener("resize", onScrollThrottled);

      // Если IntersectionObserver есть — используем как более раннее/точное
      // срабатывание, а sweep() остаётся подстраховкой на случай пропуска.
      if ("IntersectionObserver" in window) {
        const revealIo = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
                pending = pending.filter((el) => el !== entry.target);
              }
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach((el) => revealIo.observe(el));
      }
    }
  }

  /* ---------- Обратный отсчёт до церемонии ----------
     Курганинск (Краснодарский край) — часовой пояс Europe/Moscow, UTC+3,
     без перехода на летнее время. Указываем офсет явно, чтобы отсчёт
     был верным независимо от часового пояса устройства гостя. */
  const WEDDING_DATE = new Date("2026-09-19T14:30:00+03:00");
  const countdown = document.querySelector(".countdown");

  if (countdown) {
    const els = {
      days: countdown.querySelector('[data-unit="days"]'),
      hours: countdown.querySelector('[data-unit="hours"]'),
      minutes: countdown.querySelector('[data-unit="minutes"]'),
      seconds: countdown.querySelector('[data-unit="seconds"]'),
    };

    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
      const diff = WEDDING_DATE.getTime() - Date.now();
      if (diff <= 0) {
        countdown.setAttribute(
          "aria-label",
          "Свадьба уже началась — до встречи на празднике!"
        );
        if (els.days) els.days.textContent = "00";
        if (els.hours) els.hours.textContent = "00";
        if (els.minutes) els.minutes.textContent = "00";
        if (els.seconds) els.seconds.textContent = "00";
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (els.days) els.days.textContent = String(days);
      if (els.hours) els.hours.textContent = pad(hours);
      if (els.minutes) els.minutes.textContent = pad(minutes);
      if (els.seconds) els.seconds.textContent = pad(seconds);
    };

    tick();
    const timer = setInterval(tick, 1000);
  }

  /* ---------- Фото: аккуратный запасной вариант, если файла ещё нет ---------- */
  document.querySelectorAll(".photo img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        img.closest(".photo")?.classList.add("photo--empty");
        img.remove();
      },
      { once: true }
    );
  });

  /* ---------- Дресс-код: копирование HEX по клику на образец ----------
     Образцы — настоящие <button>, так что фокус/Enter/Space уже работают
     из коробки, добавлять их вручную не нужно. */
  document.querySelectorAll(".swatch[data-hex]").forEach((swatch) => {
    const hex = swatch.dataset.hex;
    swatch.setAttribute("aria-label", `${swatch.querySelector(".swatch-name")?.textContent ?? ""}: скопировать код цвета ${hex}`);

    swatch.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(hex);
        swatch.classList.add("is-copied");
        setTimeout(() => swatch.classList.remove("is-copied"), 1400);
      } catch (_) {
        /* буфер обмена недоступен — молча игнорируем, это необязательная приятность */
      }
    });
  });

})();
