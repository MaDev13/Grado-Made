/**
 * Madelaine Blanco — Compilando un sueño
 * Invitación interactiva · Vanilla JS
 */
const CONFIG = {
  eventDate: "2026-10-02T18:00:00",
  location: "Calle 59 #24 - 26, Los Andes, Barranquilla",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Cl.+59+%2324-26,+Suroccidente,+Barranquilla,+Atl%C3%A1ntico",
  rsvpFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScyYMZkRdUfIYMyHEkQibeThvaQpdErHKPYjVm0IChfrtfccg/viewform?usp=header",
};

const $ = (sel, root = document) => root.querySelector(sel);

/* ── Utilidades ── */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateProgress(barEl, percentEl, duration, onComplete) {
  const bar = barEl;
  const label = percentEl;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(progress * 100);

    bar.style.width = `${value}%`;
    if (label) label.textContent = `${value}%`;
    bar.closest("[role='progressbar']")?.setAttribute("aria-valuenow", String(value));

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else if (onComplete) {
      onComplete();
    }
  }

  requestAnimationFrame(frame);
}

/* ── PANTALLA 1 · Loading gate ── */
function initGate() {
  const gate = $("#gate");
  const app = $("#app");
  const bar = $("#gate-bar");
  const percent = $("#gate-percent");
  const status = $("#gate-status");
  const ready = $("#gate-ready");
  const guest = $("#gate-guest");
  const enterBtn = $("#btn-enter");

  if (!gate || !app) return;

  const finishLoading = () => {
    if (status) status.hidden = true;
    if (ready) ready.hidden = false;
    if (guest) guest.hidden = false;
    if (enterBtn) enterBtn.hidden = false;
  };

  if (prefersReducedMotion()) {
    bar.style.width = "100%";
    if (percent) percent.textContent = "100%";
    finishLoading();
  } else {
    animateProgress(bar, percent, 2200, finishLoading);
  }

  enterBtn?.addEventListener("click", () => {
    gate.classList.add("is-hidden");
    gate.setAttribute("aria-hidden", "true");
    app.hidden = false;
    initCountdown();
    revealDashboard();
    initScrollReveal();
    window.setTimeout(() => gate.remove(), 900);
  });
}

/* ── Countdown ── */
function initCountdown() {
  const root = $("#countdown");
  if (!root) return;

  const nodes = {
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]'),
  };

  const target = new Date(CONFIG.eventDate);
  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  function tick() {
    let diff = target.getTime() - Date.now();
    if (diff <= 0) {
      nodes.days.textContent = "00";
      nodes.hours.textContent = "00";
      nodes.minutes.textContent = "00";
      nodes.seconds.textContent = "00";
      return;
    }

    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);

    nodes.days.textContent = pad(days);
    nodes.hours.textContent = pad(hours);
    nodes.minutes.textContent = pad(minutes);
    nodes.seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

function revealDashboard() {
  document.querySelectorAll(".dashboard .reveal").forEach((el, i) => {
    window.setTimeout(() => el.classList.add("is-visible"), 60 + i * 90);
  });
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ── RSVP · Google Forms ── */
function getEmbeddedFormUrl(url) {
  if (!url) return "";
  const clean = url.trim().split("#")[0];
  if (clean.includes("embedded=true")) return clean;
  return clean.includes("?") ? `${clean}&embedded=true` : `${clean}?embedded=true`;
}

function initRsvp() {
  const modal = $("#modal-rsvp");
  const iframe = $("#rsvp-iframe");
  const pending = $("#rsvp-pending");
  const openExternal = $("#rsvp-open-external");
  const frame = $("#rsvp-frame");
  const thanks = $("#rsvp-thanks");
  const lead = $("#rsvp-lead");
  const openBtn = $("#btn-rsvp");

  if (!modal) return;

  const formUrl = (CONFIG.rsvpFormUrl || "").trim();
  const embedUrl = getEmbeddedFormUrl(formUrl);
  let iframeLoads = 0;

  if (formUrl && iframe && pending && openExternal) {
    iframe.src = embedUrl;
    iframe.hidden = false;
    pending.hidden = true;
    openExternal.href = formUrl;
    openExternal.hidden = false;
  }

  const showThanks = () => {
    if (frame) frame.hidden = true;
    if (openExternal) openExternal.hidden = true;
    if (lead) lead.hidden = true;
    if (thanks) thanks.hidden = false;
    const title = $("#rsvp-title");
    if (title) title.textContent = "Confirmación recibida";
  };

  const resetModal = () => {
    iframeLoads = 0;
    if (frame) frame.hidden = false;
    if (thanks) thanks.hidden = true;
    if (lead) lead.hidden = false;
    if (openExternal && formUrl) openExternal.hidden = false;
    const title = $("#rsvp-title");
    if (title) title.textContent = "Confirmar asistencia";
    if (iframe && formUrl) iframe.src = embedUrl;
  };

  iframe?.addEventListener("load", () => {
    iframeLoads += 1;
    if (iframeLoads >= 2) showThanks();
  });

  const open = (e) => {
    e.preventDefault();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".modal__close")?.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    resetModal();
  };

  openBtn?.addEventListener("click", open);

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initRsvp();
});
