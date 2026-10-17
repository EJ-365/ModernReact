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
    if (skyline) {
      const dusk = skyline.classList.contains("dusk-skyline");
      skyline.style.transform = dusk
        ? `translate(calc(-50% + ${mx * 8}px), ${my * 4}px)`
        : `translate(${mx * 8}px, ${my * 4}px)`;
    }
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

function setupPreview() {
  const stage = document.querySelector("[data-preview-stage]");
  const hint = $("previewHint");
  const badge = $("previewBadge");
  const clock = $("previewClock");
  const frame = document.querySelector("[data-peek-frame]");
  const modes = document.querySelectorAll("[data-peek]");
  if (!stage || !modes.length) return;

  const copy = {
    traffic: {
      hint: "Live 3D beltways — same OSM roads as the full sim, cars already moving.",
      badge: "Live traffic",
    },
    tour: {
      hint: "Street-level downtown — the view Tour Houston uses when you pick a pin.",
      badge: "Tour view",
    },
    flight: {
      hint: "Over IAH — approach corridors and the sky you’ll fly in the full sim.",
      badge: "Flight view",
    },
  };

  const keys = ["traffic", "tour", "flight"];
  let i = 0;
  let timer = 0;
  let peekReady = false;
  let pendingMode = "traffic";
  let visible = false;
  let unloadTimer = 0;
  /* Cache-bust so the homepage iframe picks up the latest peek build */
  const PEEK_SRC = "/app.html?peek=1&v=103125";

  const postPeek = (payload) => {
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { type: "hts-peek", ...payload },
        location.origin
      );
    } catch (e) {}
  };

  const setPaused = (paused) => {
    if (!peekReady) return;
    postPeek({ pause: !!paused, mode: pendingMode });
  };

  const apply = (key) => {
    pendingMode = key;
    stage.dataset.mode = key;
    modes.forEach((btn) => {
      const on = btn.getAttribute("data-peek") === key;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    const c = copy[key] || copy.traffic;
    if (hint) hint.textContent = c.hint;
    if (badge) badge.textContent = c.badge;
    if (peekReady && visible) postPeek({ mode: key, pause: false });
  };

  const tickClock = () => {
    if (!clock) return;
    try {
      const t = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit",
      });
      clock.textContent = `Houston · ${t}`;
    } catch (e) {
      clock.textContent = "Houston · live";
    }
  };

  const loadPeek = () => {
    if (!frame) return;
    if (unloadTimer) {
      clearTimeout(unloadTimer);
      unloadTimer = 0;
    }
    if (frame.dataset.loaded === "1") {
      setPaused(false);
      return;
    }
    frame.dataset.loaded = "1";
    peekReady = false;
    stage.classList.remove("is-live");
    frame.src = PEEK_SRC;
  };

  const unloadPeek = () => {
    if (!frame || frame.dataset.loaded !== "1") return;
    setPaused(true);
    /* Grace period so scroll-back doesn’t cold-boot every time */
    unloadTimer = setTimeout(() => {
      unloadTimer = 0;
      if (visible) return;
      try {
        frame.src = "about:blank";
      } catch (e) {}
      frame.dataset.loaded = "0";
      peekReady = false;
      stage.classList.remove("is-live");
    }, 5000);
  };

  if (frame) {
    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin || !e.data || e.data.type !== "hts-peek-ready")
        return;
      peekReady = true;
      stage.classList.add("is-live");
      postPeek({ mode: pendingMode, pause: !visible });
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const ent of entries) {
            visible = ent.isIntersecting && ent.intersectionRatio > 0.08;
            if (visible) {
              loadPeek();
              setPaused(false);
            } else if (frame.dataset.loaded === "1") {
              unloadPeek();
            }
          }
        },
        { rootMargin: "80px 0px", threshold: [0, 0.08, 0.25] }
      );
      io.observe(stage);
    } else {
      visible = true;
      loadPeek();
    }
  }

  const restartCycle = () => {
    if (prefersReducedMotion()) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      i = (i + 1) % keys.length;
      apply(keys[i]);
    }, 5600);
  };

  modes.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-peek");
      i = Math.max(0, keys.indexOf(key));
      apply(key);
      restartCycle();
    });
  });

  apply("traffic");
  tickClock();
  setInterval(tickClock, 15000);
  restartCycle();

  stage.addEventListener("mouseenter", () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
    if (visible) {
      loadPeek();
      postPeek({ mode: pendingMode, pause: false });
    }
  });
  stage.addEventListener("mouseleave", () => {
    restartCycle();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true);
    else if (visible) setPaused(false);
  });
}

setupNav();
setupInstall();
registerSW();
setupStars();
setupReveal();
setupCounters();
setupParallax();
setupPreview();
