(() => {
  const root = document.documentElement;
  const searchOverlay = document.getElementById("search-overlay");
  const overlayInput = document.getElementById("overlay-search");
  const results = document.getElementById("search-results");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const sections = [...document.querySelectorAll(".doc-section")];

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem("bro-sba-py-docs-theme", theme); } catch (_) {}
  };
  try {
    const savedTheme = localStorage.getItem("bro-sba-py-docs-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  } catch (_) {}
  document.getElementById("theme-toggle").addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  function openSearch(query = "") {
    searchOverlay.classList.add("open");
    searchOverlay.setAttribute("aria-hidden", "false");
    overlayInput.value = query;
    renderResults(query);
    window.setTimeout(() => overlayInput.focus(), 0);
  }
  function closeSearch() {
    searchOverlay.classList.remove("open");
    searchOverlay.setAttribute("aria-hidden", "true");
  }
  function renderResults(query) {
    const term = query.trim().toLowerCase();
    if (!term) {
      results.innerHTML = '<div class="search-hint">Type to search documentation</div>';
      return;
    }
    const matches = sections.filter((section) => section.innerText.toLowerCase().includes(term)).slice(0, 12);
    if (!matches.length) {
      results.innerHTML = '<div class="no-results">No matching documentation found.</div>';
      return;
    }
    results.innerHTML = matches.map((section) => {
      const title = section.dataset.title || section.querySelector("h1,h2")?.innerText || section.id;
      const excerpt = section.innerText.replace(/\s+/g, " ").trim().slice(0, 150);
      return `<a class="search-result" href="#${section.id}"><b>${escapeHtml(title)}</b><span>${escapeHtml(excerpt)}</span></a>`;
    }).join("");
  }
  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  document.querySelectorAll(".search-wrap input").forEach((input) => {
    input.addEventListener("focus", () => openSearch(input.value));
    input.addEventListener("input", () => openSearch(input.value));
  });
  overlayInput.addEventListener("input", () => renderResults(overlayInput.value));
  searchOverlay.addEventListener("click", (event) => {
    if (event.target === searchOverlay) closeSearch();
  });
  results.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeSearch();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    } else if (event.key === "Escape") {
      closeSearch();
      sidebar.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      sidebar.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied";
      } catch (_) {
        button.textContent = "Select code";
      }
      window.setTimeout(() => { button.textContent = original; }, 1400);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      const id = visible.target.id;
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }, { rootMargin: "-15% 0px -72% 0px" });
    sections.forEach((section) => observer.observe(section));
  }
})();
