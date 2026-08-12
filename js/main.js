/* =========================================================
   Sai Grand Kirana & General Store — Vanilla JS engine
   Smooth momentum scroll + reveals + parallax + UI.
   No libraries.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches || "ontouchstart" in window;
  var wide = window.matchMedia("(min-width: 1024px)").matches;
  // Native scrolling for maximum robustness across browsers (no scroll hijack).
  var useSmooth = false;

  /* ---------- on-load hero reveal ---------- */
  window.addEventListener("load", function () {
    document.body.classList.add("is-loaded");
  });
  // fallback if load is slow
  setTimeout(function () { document.body.classList.add("is-loaded"); }, 700);

  /* ---------- parallax (native scroll) ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  function setHeight() {}
  if (!reduce && parallaxEls.length) {
    var ticking = false;
    function applyParallax() {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        var rect = el.getBoundingClientRect();
        var offset = (rect.top - window.innerHeight / 2) * speed;
        el.style.transform = "translate3d(0," + (offset * -1) + "px,0) scale(1.12)";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); }
    }, { passive: true });
    applyParallax();
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = e.target.getAttribute("data-delay");
          if (d) e.target.style.transitionDelay = (parseFloat(d) * 0.09) + "s";
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- nav: scrolled + hide-on-scroll ---------- */
  var nav = document.getElementById("nav");
  var lastY = 0;
  function navUpdate() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) {
      nav.classList.toggle("scrolled", y > 40);
      if (y > 400 && y > lastY) nav.classList.add("hidden");
      else nav.classList.remove("hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", navUpdate, { passive: true });
  navUpdate();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var to = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1600, start = null;
        function step(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * to) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = to + suffix;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- product filters ---------- */
  var filters = document.querySelectorAll("[data-filter]");
  var products = document.querySelectorAll("[data-category]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (f) { f.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      products.forEach(function (p) {
        var show = cat === "all" || p.getAttribute("data-category") === cat;
        p.classList.toggle("hide", !show);
      });
      setHeight();
    });
  });

  /* ---------- gallery lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lb]"));
    var idx = 0;
    function open(i) {
      idx = i;
      lbImg.src = items[idx].getAttribute("data-lb");
      lb.classList.add("open");
    }
    function close() { lb.classList.remove("open"); }
    function nav2(dir) { idx = (idx + dir + items.length) % items.length; lbImg.src = items[idx].getAttribute("data-lb"); }
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-next").addEventListener("click", function () { nav2(1); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { nav2(-1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") nav2(1);
      if (e.key === "ArrowLeft") nav2(-1);
    });
  }

  /* ---------- contact form -> WhatsApp ---------- */
  var form = document.getElementById("enquiryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var phone = (form.querySelector("[name=phone]") || {}).value || "";
      var subject = (form.querySelector("[name=subject]") || {}).value || "";
      var message = (form.querySelector("[name=message]") || {}).value || "";
      var text = "Hello Sai Grand Kirana, I have an enquiry.%0A%0A" +
        "Name: " + encodeURIComponent(name) + "%0A" +
        "Phone: " + encodeURIComponent(phone) + "%0A" +
        "Regarding: " + encodeURIComponent(subject) + "%0A" +
        "Message: " + encodeURIComponent(message);
      window.open("https://wa.me/919975757021?text=" + text, "_blank");
      var ok = document.getElementById("formSuccess");
      if (ok) { ok.style.display = "flex"; }
      form.reset();
    });
  }

  /* ---------- smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 80;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---------- current year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
