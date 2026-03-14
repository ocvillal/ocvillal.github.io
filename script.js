document.addEventListener("DOMContentLoaded", () => {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  let currentIndex = 0;

  const showScene = (index) => {
    if (index < 0 || index >= scenes.length) index = 0;
    currentIndex = index;
    scenes.forEach((scene, i) => {
      scene.classList.toggle("scene-active", i === index);
    });
  };

  const ensureSceneVisible = () => {
    requestAnimationFrame(() => {
      const active = document.querySelector(".scene.scene-active");
      if (!active) showScene(0);
    });
  };

  document.querySelectorAll("[data-scene-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scene-target");
      const index = scenes.findIndex((s) => s.dataset.scene === target);
      if (index !== -1) showScene(index);
    });
  });

  document.querySelectorAll("[data-action='prev']").forEach((btn) => {
    btn.addEventListener("click", () => {
      showScene((currentIndex - 1 + scenes.length) % scenes.length);
    });
  });

  document.querySelectorAll("[data-action='next']").forEach((btn) => {
    btn.addEventListener("click", () => {
      showScene((currentIndex + 1) % scenes.length);
    });
  });

  // Keyboard: arrow keys to navigate scenes
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      showScene((currentIndex + 1) % scenes.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      showScene((currentIndex - 1 + scenes.length) % scenes.length);
    }
  });

  // Menu button toggle (mobile/breakpoint)
  document.querySelectorAll(".pkmn-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bar = btn.closest(".pkmn-blue-bar");
      if (bar) {
        bar.classList.toggle("is-menu-open");
        btn.setAttribute("aria-expanded", bar.classList.contains("is-menu-open"));
      }
    });
  });

  // Fix blank screen when returning from external link or tab switch (mobile bfcache)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) ensureSceneVisible();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ensureSceneVisible();
  });

  // Scroll wheel: switch sections (high threshold so it's not too sensitive)
  let scrollAccum = 0;
  const scrollThreshold = 400;
  document.addEventListener("wheel", (e) => {
    e.preventDefault();
    scrollAccum += e.deltaY;
    if (scrollAccum >= scrollThreshold) {
      scrollAccum = 0;
      showScene((currentIndex + 1) % scenes.length);
    } else if (scrollAccum <= -scrollThreshold) {
      scrollAccum = 0;
      showScene((currentIndex - 1 + scenes.length) % scenes.length);
    }
  }, { passive: false });
});
