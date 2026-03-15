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

  // Project selection (Mario Kart character-select style)
  const updateProjectPanel = (box) => {
    if (!box) return;
    const name = document.getElementById("project-selected-name");
    const subtitle = document.getElementById("project-subtitle");
    const imgWrap = document.getElementById("project-image-wrap");
    const img = document.getElementById("project-selected-image");
    const desc = document.getElementById("project-selected-desc");
    const techList = document.getElementById("project-tech-list");
    const linksWrap = document.getElementById("project-selected-links");
    if (name) name.textContent = box.dataset.name || "";
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
      techList.innerHTML = tech.split("|").filter(Boolean).map(t => `<li>${t.trim()}</li>`).join("") || "<li>—</li>";
    }
    const code = (box.dataset.code || "").trim();
    const demo = (box.dataset.demo || "").trim();
    const video = (box.dataset.video || "").trim();
    let html = "";
    if (demo && demo !== "#") html += `<a href="${demo}" target="_blank" rel="noreferrer" class="project-link">Visit</a>`;
    if (code && code !== "#") html += `<a href="${code}" target="_blank" rel="noreferrer" class="project-link">Code</a>`;
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

  // Set cropped thumbnail in each project box from data-image
  document.querySelectorAll(".project-box").forEach((box) => {
    const wrap = box.querySelector(".project-box-thumb-wrap");
    const thumb = box.querySelector(".project-box-thumb");
    const src = box.dataset.image || "";
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
