/**
 * St. Tammany Parish Fencing Pros — Premium rebuild interactions
 */

(function () {
  "use strict";

  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const yearEl = document.getElementById("year");
  const form = document.getElementById("estimateForm");
  const formSuccess = document.getElementById("formSuccess");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroVideo = document.querySelector(".hero-video");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Location links: local paths in dev, production domains live */
  (function wireLocationLinks() {
    var host = window.location.hostname;
    var isLocal = host === "localhost" || host === "127.0.0.1";
    var urls = {
      st: isLocal ? "/" : "https://st-tammany-parish-fencing-pros.vercel.app/",
      nola: isLocal ? "/new-orleans/" : "https://new-orleans-fencing-pros.vercel.app/",
    };
    document.querySelectorAll("[data-loc]").forEach(function (el) {
      var key = el.getAttribute("data-loc");
      if (urls[key]) el.setAttribute("href", urls[key]);
    });
  })();

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24);
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    if (header && window.scrollY <= 24) header.classList.remove("is-solid");
  }

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    if (header) header.classList.add("is-solid");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* Pause hero video when off-screen / reduced motion */
  function updateHeroVideo() {
    if (!heroVideo) return;
    if (prefersReduced) {
      heroVideo.pause();
      return;
    }
    const rect = heroVideo.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (visible) {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    } else {
      heroVideo.pause();
    }
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal, [data-depth]");
    if (!nodes.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initTilt() {
    if (prefersReduced || window.matchMedia("(hover: none)").matches) return;

    document.querySelectorAll(".svc-card, .step").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" +
          (y * -4).toFixed(2) +
          "deg) rotateY(" +
          (x * 4).toFixed(2) +
          "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function validateField(field) {
    const value = (field.value || "").trim();
    let valid = true;
    if (field.required && !value) valid = false;
    if (field.type === "email" && value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (field.type === "tel" && value) valid = value.replace(/\D/g, "").length >= 10;
    field.classList.toggle("is-invalid", !valid);
    return valid;
  }

  if (form) {
    const required = form.querySelectorAll("[required]");
    required.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let ok = true;
      required.forEach(function (field) {
        if (!validateField(field)) ok = false;
      });
      if (!ok) {
        const first = form.querySelector(".is-invalid");
        if (first) first.focus();
        return;
      }
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "nearest",
        });
      }
      form.reset();
      required.forEach(function (field) {
        field.classList.remove("is-invalid");
      });
      window.setTimeout(function () {
        if (formSuccess) formSuccess.hidden = true;
      }, 8000);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader();
      updateHeroVideo();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateHeader();
  updateHeroVideo();
  initReveal();
  initTilt();
})();
