document.addEventListener("DOMContentLoaded", () => {
  const scenes    = Array.from(document.querySelectorAll(".scene"));
  const lbox      = document.getElementById("visit-lbox");
  const infoLbox  = document.getElementById("info-lbox");
  const screen    = document.querySelector(".gba-screen");
  const dots      = Array.from(document.querySelectorAll(".scene-dot"));

  let currentIndex = 0;
  let isAnimating  = false;

  /* ── Scene switching ─────────────────────────────────────────── */
  const ANIM_MS = 260; // must be >= CSS animation duration

  const showScene = (index) => {
    if (isAnimating) return;
    if (index < 0 || index >= scenes.length) index = 0;
    if (index === currentIndex) return;

    const dir  = index > currentIndex ? "fwd" : "back";
    const prev = scenes[currentIndex];
    const next = scenes[index];

    currentIndex = index;
    isAnimating  = true;

    // Outgoing scene – hide instantly (it's behind the incoming one)
    prev.classList.remove("scene-active", "scene-dir-fwd", "scene-dir-back");
    prev.setAttribute("aria-hidden", "true");

    // Incoming scene – slide in from the correct side
    next.classList.remove("scene-dir-fwd", "scene-dir-back");
    next.classList.add(dir === "fwd" ? "scene-dir-fwd" : "scene-dir-back", "scene-active");
    next.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      next.classList.remove("scene-dir-fwd", "scene-dir-back");
      isAnimating = false;
    }, ANIM_MS);

    updateDots(index);
  };

  // Set initial aria-hidden state
  scenes.forEach((s, i) => s.setAttribute("aria-hidden", i === 0 ? "false" : "true"));

  /* ── Page-dot indicators ─────────────────────────────────────── */
  const updateDots = (idx) => {
    dots.forEach((d, i) => d.classList.toggle("scene-dot-active", i === idx));
  };
  updateDots(0);

  /* ── D-pad, scene-target buttons (including dots) ────────────── */
  document.querySelectorAll("[data-scene-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scene-target");
      const index  = scenes.findIndex((s) => s.dataset.scene === target);
      if (index !== -1) showScene(index);
    });
  });

  document.querySelectorAll("[data-action='prev']").forEach((btn) => {
    btn.addEventListener("click", () =>
      showScene((currentIndex - 1 + scenes.length) % scenes.length)
    );
  });

  document.querySelectorAll("[data-action='next']").forEach((btn) => {
    btn.addEventListener("click", () =>
      showScene((currentIndex + 1) % scenes.length)
    );
  });

  /* ── Keyboard arrows ─────────────────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    if (lbox?.classList.contains("visit-lbox-is-open"))    return;
    if (infoLbox?.classList.contains("info-lbox-is-open")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      showScene((currentIndex + 1) % scenes.length);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      showScene((currentIndex - 1 + scenes.length) % scenes.length);
  });

  /* ── Touch swipe left / right ────────────────────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_MIN = 50; // px – minimum horizontal distance to count as a swipe

  if (screen) {
    screen.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    screen.addEventListener("touchend", (e) => {
      if (lbox?.classList.contains("visit-lbox-is-open"))    return;
      if (infoLbox?.classList.contains("info-lbox-is-open")) return;

      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // Only trigger when swipe is more horizontal than vertical and long enough
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_MIN) {
        if (dx < 0) showScene((currentIndex + 1) % scenes.length);   // swipe left → next
        else        showScene((currentIndex - 1 + scenes.length) % scenes.length); // swipe right → prev
      }
    }, { passive: true });
  }

  /* ── Scroll wheel (boundary-aware) ──────────────────────────── */
  // Only intercept the wheel when the element being scrolled has hit
  // the top or bottom of its own scrollable content. This lets the
  // bio text, timeline, etc. scroll naturally without fighting the user.

  const isScrollableEl = (el) => {
    if (!el || el === document.documentElement) return false;
    const oy = getComputedStyle(el).overflowY;
    return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1;
  };

  const isAtScrollBoundary = (target, deltaY) => {
    let el = target;
    while (el && el !== document.documentElement) {
      if (isScrollableEl(el)) {
        if (deltaY > 0 && el.scrollTop < el.scrollHeight - el.clientHeight - 2) return false;
        if (deltaY < 0 && el.scrollTop > 1) return false;
      }
      el = el.parentElement;
    }
    return true;
  };

  // Two-flag wheel system:
  //   wheelNavigated  – did we already flip a page in this gesture?
  //   wheelResetTimer – resets the flag only after wheel events stop arriving
  let wheelNavigated  = false;
  let wheelResetTimer = null;

  document.addEventListener("wheel", (e) => {
    if (lbox?.classList.contains("visit-lbox-is-open"))    return;
    if (infoLbox?.classList.contains("info-lbox-is-open")) return;

    // Not at boundary: let the content scroll naturally and keep the flag clear
    if (!isAtScrollBoundary(e.target, e.deltaY)) return;

    e.preventDefault();

    // Keep resetting the "gesture is over" timer on every event so it only
    // fires once the user has fully stopped scrolling.
    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => { wheelNavigated = false; }, 600);

    // Already flipped a page during this gesture – ignore the rest.
    if (wheelNavigated) return;

    wheelNavigated = true;
    if (e.deltaY > 0) showScene((currentIndex + 1) % scenes.length);
    else if (e.deltaY < 0) showScene((currentIndex - 1 + scenes.length) % scenes.length);
  }, { passive: false });

  /* ── Project selection ───────────────────────────────────────── */
  const updateProjectPanel = (box) => {
    if (!box) return;
    const name      = document.getElementById("project-selected-name");
    const subtitle  = document.getElementById("project-subtitle");
    const imgWrap   = document.getElementById("project-image-wrap");
    const img       = document.getElementById("project-selected-image");
    const desc      = document.getElementById("project-selected-desc");
    const techList  = document.getElementById("project-tech-list");
    const linksWrap = document.getElementById("project-selected-links");

    if (name)     name.textContent     = box.dataset.name     || "";
    if (subtitle) subtitle.textContent = box.dataset.subtitle || "";

    const imageSrc = box.dataset.image || "";
    if (img && imgWrap) {
      if (imageSrc) {
        img.src = imageSrc;
        img.alt = box.dataset.name ? `${box.dataset.name} preview` : "";
        imgWrap.classList.remove("has-no-image");
      } else {
        img.removeAttribute("src");
        img.alt = "";
        imgWrap.classList.add("has-no-image");
      }
    }

    if (desc) desc.textContent = box.dataset.desc || "";

    const tech = box.dataset.tech || "";
    if (techList) {
      techList.innerHTML =
        tech.split("|").filter(Boolean).map(t => `<li>${t.trim()}</li>`).join("") || "<li>—</li>";
    }

    const code  = (box.dataset.code  || "").trim();
    const demo  = (box.dataset.demo  || "").trim();
    const video = (box.dataset.video || "").trim();
    let html = "";
    if (demo  && demo  !== "#") html += `<a href="${demo}"  target="_blank" rel="noreferrer" class="project-link">Visit</a>`;
    if (code  && code  !== "#") html += `<a href="${code}"  target="_blank" rel="noreferrer" class="project-link">Code</a>`;
    if (video && video !== "#") html += `<a href="${video}" target="_blank" rel="noreferrer" class="project-link project-link-video">Demo</a>`;
    if (linksWrap) linksWrap.innerHTML = html || "";
  };

  document.querySelectorAll(".project-box").forEach((box) => {
    box.addEventListener("click", () => {
      document.querySelectorAll(".project-box").forEach((b) => b.classList.remove("project-box-selected"));
      box.classList.add("project-box-selected");
      updateProjectPanel(box);
    });
  });

  const initialProject = document.querySelector(".project-box-selected");
  if (initialProject) updateProjectPanel(initialProject);

  document.querySelectorAll(".project-box").forEach((box) => {
    const wrap  = box.querySelector(".project-box-thumb-wrap");
    const thumb = box.querySelector(".project-box-thumb");
    const src   = box.dataset.image || "";
    if (wrap && thumb) {
      if (src) {
        thumb.src = src;
        thumb.alt = box.dataset.name ? `${box.dataset.name} preview` : "";
        wrap.classList.add("has-image");
      } else {
        wrap.classList.remove("has-image");
      }
    }
  });

  /* ── Visit lightbox ──────────────────────────────────────────── */
  const openLbox = () => {
    if (!lbox) return;
    lbox.classList.add("visit-lbox-is-open");
    lbox.setAttribute("aria-hidden", "false");
    document.querySelectorAll(".pkmn-menu-btn").forEach((b) => b.setAttribute("aria-expanded", "true"));
  };
  const closeLbox = () => {
    if (!lbox) return;
    lbox.classList.remove("visit-lbox-is-open");
    lbox.setAttribute("aria-hidden", "true");
    document.querySelectorAll(".pkmn-menu-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  };

  document.querySelectorAll(".pkmn-menu-btn").forEach((btn) => btn.addEventListener("click", openLbox));
  const lboxBackdrop = lbox?.querySelector(".visit-lbox-backdrop");
  const lboxClose    = lbox?.querySelector(".visit-lbox-close");
  if (lboxBackdrop) lboxBackdrop.addEventListener("click", closeLbox);
  if (lboxClose)    lboxClose.addEventListener("click", closeLbox);

  /* ── Info lightbox ───────────────────────────────────────────── */
  const openInfoLbox = () => {
    if (!infoLbox) return;
    infoLbox.classList.add("info-lbox-is-open");
    infoLbox.setAttribute("aria-hidden", "false");
    document.querySelectorAll(".pkmn-info-btn").forEach((b) => b.setAttribute("aria-expanded", "true"));
  };
  const closeInfoLbox = () => {
    if (!infoLbox) return;
    infoLbox.classList.remove("info-lbox-is-open");
    infoLbox.setAttribute("aria-hidden", "true");
    document.querySelectorAll(".pkmn-info-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  };

  document.querySelectorAll(".pkmn-info-btn").forEach((btn) => btn.addEventListener("click", openInfoLbox));
  const infoLboxBackdrop = infoLbox?.querySelector(".info-lbox-backdrop");
  const infoLboxClose    = infoLbox?.querySelector(".info-lbox-close");
  if (infoLboxBackdrop) infoLboxBackdrop.addEventListener("click", closeInfoLbox);
  if (infoLboxClose)    infoLboxClose.addEventListener("click", closeInfoLbox);

  /* ── Shared Escape key handler ───────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lbox?.classList.contains("visit-lbox-is-open"))    closeLbox();
    else if (infoLbox?.classList.contains("info-lbox-is-open")) closeInfoLbox();
  });

  /* ── Visit lightbox page boxes ───────────────────────────────── */
  document.querySelectorAll(".visit-lbox-box").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scene-target");
      const index  = scenes.findIndex((s) => s.dataset.scene === target);
      if (index !== -1) showScene(index);
      closeLbox();
    });
  });

  /* ── Restore scene on bfcache / tab return ───────────────────── */
  const ensureSceneVisible = () => {
    requestAnimationFrame(() => {
      if (!scenes[currentIndex]?.classList.contains("scene-active")) {
        scenes.forEach((s, i) => {
          s.classList.toggle("scene-active", i === currentIndex);
          s.setAttribute("aria-hidden", i === currentIndex ? "false" : "true");
        });
        updateDots(currentIndex);
      }
    });
  };

  window.addEventListener("pageshow", (e) => { if (e.persisted) ensureSceneVisible(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ensureSceneVisible();
  });
});
