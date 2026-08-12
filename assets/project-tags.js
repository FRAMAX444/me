(() => {
  "use strict";

  const normalize = value => String(value || "").trim().toLowerCase();

  function enhanceProjectFilters() {
    if (document.body.dataset.page !== "projects") return false;

    const list = document.querySelector(".project-list");
    const bar = document.querySelector(".filter-bar");
    if (!list || !bar || bar.dataset.tagEnhanced === "true") return false;

    const rows = [...list.querySelectorAll(".project-row")];
    if (!rows.length) return false;

    const labels = new Map();

    rows.forEach(row => {
      const currentTags = [...row.querySelectorAll(".tag-line span")];
      const values = currentTags.map(tag => tag.textContent.trim()).filter(Boolean);
      row.dataset.projectTags = values.map(normalize).join("|");

      currentTags.forEach(tag => {
        const label = tag.textContent.trim();
        const key = normalize(label);
        if (!label || !key) return;
        labels.set(key, label);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "project-inline-tag";
        button.dataset.projectInlineTag = key;
        button.textContent = label;
        tag.replaceWith(button);
      });
    });

    const orderedTags = [...labels.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    bar.classList.add("project-tag-filter");
    bar.dataset.tagEnhanced = "true";
    bar.setAttribute("aria-label", "Filter projects by tag");
    bar.innerHTML = `
      <span class="project-filter-label">Filter by tag</span>
      <button class="filter-btn active" type="button" data-project-tag="all" aria-pressed="true">All</button>
      ${orderedTags.map(([key, label]) => `<button class="filter-btn" type="button" data-project-tag="${key}" aria-pressed="false">${label}</button>`).join("")}`;

    const filterButtons = [...bar.querySelectorAll("[data-project-tag]")];

    const applyFilter = value => {
      filterButtons.forEach(button => {
        const active = button.dataset.projectTag === value;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      rows.forEach(row => {
        const tags = String(row.dataset.projectTags || "").split("|").filter(Boolean);
        row.hidden = value !== "all" && !tags.includes(value);
      });
    };

    filterButtons.forEach(button => {
      button.addEventListener("click", () => applyFilter(button.dataset.projectTag || "all"));
    });

    list.addEventListener("click", event => {
      const button = event.target.closest("[data-project-inline-tag]");
      if (!button) return;
      applyFilter(button.dataset.projectInlineTag || "all");
      bar.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return true;
  }

  if (!enhanceProjectFilters()) {
    const target = document.getElementById("main") || document.body;
    const observer = new MutationObserver(() => {
      if (enhanceProjectFilters()) observer.disconnect();
    });
    observer.observe(target, { childList: true, subtree: true });
  }
})();
