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

  /* ---------- Дресс-код: копирование HEX по клику на образец ---------- */
  document.querySelectorAll(".swatch[data-hex]").forEach((swatch) => {
    swatch.style.cursor = "pointer";
    swatch.setAttribute("tabindex", "0");
    swatch.setAttribute("role", "button");
    const hex = swatch.dataset.hex;
    swatch.setAttribute("aria-label", `Скопировать код цвета ${hex}`);

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(hex);
        const name = swatch.querySelector(".swatch-name");
        if (!name) return;
        const original = name.textContent;
        name.textContent = "Скопировано: " + hex;
        setTimeout(() => {
          name.textContent = original;
        }, 1400);
      } catch (_) {
        /* буфер обмена недоступен — молча игнорируем, это необязательная приятность */
      }
    };

    swatch.addEventListener("click", copy);
    swatch.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copy();
      }
    });
  });

  /* ---------- RSVP форма ----------
     ВАЖНО ДЛЯ ЗАПУСКА: пропишите свой адрес приёма заявок в ENDPOINT.
     Подходит форма Formspree/Getform/Google-форма-скрипт — подробности в README.
     Если ENDPOINT не задан или запрос не удался, форма аккуратно
     откатывается на отправку письма (mailto) с той же информацией,
     и в любом случае сохраняет ответ локально (localStorage) как копию. */
  const ENDPOINT = ""; // например: "https://formspree.io/f/xxxxxxx"
  const COUPLE_EMAIL = "your-email@example.com"; // замените на свою почту

  const form = document.querySelector(".rsvp-form");
  if (form) {
    const attendingRadios = form.querySelectorAll('input[name="attending"]');
    const guestsField = document.getElementById("guests-field");
    const statusEl = form.querySelector(".rsvp-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const successEl = document.querySelector(".rsvp-success");

    const syncGuestsField = () => {
      const checked = form.querySelector('input[name="attending"]:checked');
      const attending = checked && checked.value === "yes";
      guestsField?.classList.toggle("is-visible", Boolean(attending));
      const guestsInput = document.getElementById("guests");
      if (guestsInput) guestsInput.required = Boolean(attending);
    };

    attendingRadios.forEach((r) => r.addEventListener("change", syncGuestsField));
    syncGuestsField();

    const setError = (field, message) => {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("has-error");
      const errorEl = wrap.querySelector(".error-text");
      if (errorEl) errorEl.textContent = message;
    };

    const clearErrors = () => {
      form.querySelectorAll(".field.has-error").forEach((f) => {
        f.classList.remove("has-error");
      });
    };

    const validate = (data) => {
      let valid = true;
      const nameInput = form.querySelector("#name");
      if (!data.name || data.name.trim().length < 2) {
        setError(nameInput, "Пожалуйста, укажите имя и фамилию");
        valid = false;
      }
      if (!data.attending) {
        if (statusEl) {
          statusEl.dataset.state = "error";
          statusEl.textContent = "Пожалуйста, отметьте, сможете ли вы приехать";
        }
        valid = false;
      }
      return valid;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      if (statusEl) {
        statusEl.dataset.state = "";
        statusEl.textContent = "";
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (!validate(data)) return;

      submitBtn?.classList.add("is-loading");
      submitBtn?.setAttribute("disabled", "true");
      if (statusEl) {
        statusEl.dataset.state = "sending";
        statusEl.textContent = "Отправляем ваш ответ…";
      }

      let delivered = false;

      if (ENDPOINT) {
        try {
          const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData,
          });
          delivered = res.ok;
        } catch (_) {
          delivered = false;
        }
      }

      try {
        const stored = JSON.parse(localStorage.getItem("rsvp_responses") || "[]");
        stored.push({ ...data, submittedAt: new Date().toISOString() });
        localStorage.setItem("rsvp_responses", JSON.stringify(stored));
      } catch (_) {
        /* localStorage может быть недоступен (приватный режим) — не критично */
      }

      submitBtn?.classList.remove("is-loading");
      submitBtn?.removeAttribute("disabled");

      if (delivered) {
        showSuccess();
        return;
      }

      if (!ENDPOINT) {
        // Резервный сценарий: открыть письмо с уже готовым текстом.
        const subject = encodeURIComponent(
          `RSVP: ${data.name || "Гость"} — свадьба Артёма и Юлии`
        );
        const bodyLines = [
          `Имя: ${data.name || ""}`,
          `Придёт: ${data.attending === "yes" ? "Да" : "Не сможет приехать"}`,
          data.attending === "yes" ? `Гостей: ${data.guests || 1}` : "",
          `Комментарий: ${data.message || "—"}`,
        ].filter(Boolean);
        const mailto = `mailto:${COUPLE_EMAIL}?subject=${subject}&body=${encodeURIComponent(
          bodyLines.join("\n")
        )}`;
        window.location.href = mailto;
        if (statusEl) {
          statusEl.dataset.state = "";
          statusEl.textContent =
            "Открываем почтовый клиент с готовым письмом — просто нажмите «Отправить».";
        }
        showSuccess();
        return;
      }

      if (statusEl) {
        statusEl.dataset.state = "error";
        statusEl.textContent =
          "Не получилось отправить ответ автоматически. Пожалуйста, напишите нам напрямую.";
      }
    });

    function showSuccess() {
      form.classList.add("is-hidden");
      successEl?.classList.add("is-visible");
      successEl?.setAttribute("tabindex", "-1");
      successEl?.focus();
    }
  }
})();
