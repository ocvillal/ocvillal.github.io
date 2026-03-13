document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.querySelector(".preloader");

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".nav-links a");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("nav-open");
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (nav) {
        nav.classList.remove("nav-open");
      }
    });
  });

  const themeToggle = document.getElementById("theme-toggle");

  const applyStoredTheme = () => {
    const stored = localStorage.getItem("site-theme");
    if (stored === "light") {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else if (stored === "dark") {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    }
  };

  applyStoredTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("theme-dark");
      const isLight = document.body.classList.contains("theme-light");

      if (!isDark && !isLight) {
        document.body.classList.add("theme-light");
        localStorage.setItem("site-theme", "light");
      } else if (isLight) {
        document.body.classList.remove("theme-light");
        document.body.classList.add("theme-dark");
        localStorage.setItem("site-theme", "dark");
      } else {
        document.body.classList.remove("theme-dark");
        localStorage.removeItem("site-theme");
      }
    });
  }

  window.addEventListener("load", () => {
    if (preloader) {
      preloader.classList.add("preloader-hidden");
    }
  });
});

