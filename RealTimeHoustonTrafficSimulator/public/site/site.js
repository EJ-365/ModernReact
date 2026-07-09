let deferredPrompt = null;

function $(id) {
  return document.getElementById(id);
}

function closeNavDrawer() {
  const burger = $("navBurger");
  const drawer = $("navDrawer");
  const backdrop = $("navDrawerBackdrop");
  if (drawer) drawer.setAttribute("hidden", "");
  if (backdrop) backdrop.setAttribute("hidden", "");
  if (burger) burger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function openNavDrawer() {
  const burger = $("navBurger");
  const drawer = $("navDrawer");
  const backdrop = $("navDrawerBackdrop");
  if (drawer) drawer.removeAttribute("hidden");
  if (backdrop) backdrop.removeAttribute("hidden");
  if (burger) burger.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function setupNav() {
  const burger = $("navBurger");
  const drawer = $("navDrawer");
  const backdrop = $("navDrawerBackdrop");
  const nav = document.querySelector("[data-nav]") || document.querySelector(".nav");

  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const isOpen = !drawer.hasAttribute("hidden");
      if (isOpen) closeNavDrawer();
      else openNavDrawer();
    });

    if (backdrop) backdrop.addEventListener("click", closeNavDrawer);

    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeNavDrawer());
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNavDrawer();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 961px)").matches) closeNavDrawer();
    });
  }

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}

function showInstallButtons(show) {
  ["installBtn", "installBtnMain", "installBtnDrawer"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.hidden = !show;
  });
}

async function triggerInstall() {
  const hint = $("installHint");
  if (!deferredPrompt) {
    if (hint) {
      hint.innerHTML =
        "Install isn’t available in this browser session. Open in <strong>Chrome</strong> or <strong>Edge</strong>, then use the browser menu → <strong>Install app</strong>.";
    }
    window.location.href = "/app.html";
    return;
  }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (hint) {
    hint.textContent =
      choice.outcome === "accepted"
        ? "Installed. You can launch Houston Traffic Simulator from your desktop or app list."
        : "Install dismissed. You can try again anytime from this page.";
  }
  deferredPrompt = null;
  showInstallButtons(false);
}

function setupInstall() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButtons(true);
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    showInstallButtons(false);
    const hint = $("installHint");
    if (hint) hint.textContent = "Web app installed. Look for Houston Traffic Simulator on your device.";
  });

  ["installBtn", "installBtnMain", "installBtnDrawer"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("click", triggerInstall);
  });

  if (window.matchMedia("(display-mode: standalone)").matches) {
    showInstallButtons(false);
  }
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupStars() {
  const host = $("csStars");
  if (!host) return;
  const count = window.innerWidth < 700 ? 40 : 70;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement("i");
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 55}%`;
    star.style.setProperty("--d", `${2.5 + Math.random() * 4}s`);
    star.style.animationDelay = `${-Math.random() * 5}s`;
    if (Math.random() > 0.85) {
      star.style.width = "3px";
      star.style.height = "3px";
    }
    frag.appendChild(star);
  }
  host.appendChild(frag);
}

function setupReveal() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;

  if (prefersReducedMotion()) {
    nodes.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  nodes.forEach((el) => io.observe(el));

  /* Hero copy should appear immediately */
  requestAnimationFrame(() => {
    document.querySelectorAll(".hero-content [data-reveal]").forEach((el, i) => {
      setTimeout(() => el.classList.add("is-in"), 80 + i * 90);
    });
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (prefersReducedMotion()) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => io.observe(el));
}

function setupParallax() {
  const scene = document.querySelector("[data-parallax]");
  if (!scene || prefersReducedMotion()) return;

  let raf = 0;
  let mx = 0;
  let my = 0;

  const apply = () => {
    raf = 0;
    const skyline = scene.querySelector(".cs-skyline");
    const freeway = scene.querySelector(".cs-freeway");
    const moon = scene.querySelector(".cs-moon");
    if (skyline) skyline.style.transform = `translate(${mx * 8}px, ${my * 4}px)`;
    if (freeway) freeway.style.transform = `translate(${mx * 14}px, ${my * 6}px)`;
    if (moon) moon.style.transform = `translate(${mx * -10}px, ${my * -6}px)`;
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      scene.style.transform = `translate3d(0, ${Math.min(y * 0.18, 120)}px, 0)`;
    },
    { passive: true }
  );
}

setupNav();
setupInstall();
registerSW();
setupStars();
setupReveal();
setupCounters();
setupParallax();
