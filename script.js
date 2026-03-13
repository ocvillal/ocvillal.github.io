document.addEventListener("DOMContentLoaded", () => {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  let currentIndex = 0;

  const showScene = (index) => {
    scenes.forEach((scene, i) => {
      scene.classList.toggle("scene-active", i === index);
    });
    currentIndex = index;
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
});
