(() => {
  "use strict";

  const page = document.body.dataset.page || "home";
  const main = document.getElementById("main");
  const headerRoot = document.getElementById("site-header");
  const footerRoot = document.getElementById("site-footer");
  const cache = new Map();

  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  async function getJSON(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load ${path}`);
      return response.json();
    });
    cache.set(path, promise);
    return promise;
  }

  function renderHeader(content, config) {
    const nav = content.navigation || [];
    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="container nav-shell">
          <a class="brand" href="index.html">${esc(config.profile?.name || "")}</a>
          <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
          <nav class="nav-links" aria-label="Primary navigation">
            ${nav.map(item => `<a class="nav-link ${item.id === page ? "active" : ""}" href="${esc(item.href)}" ${item.id === page ? 'aria-current="page"' : ""}>${esc(item.label)}</a>`).join("")}
          </nav>
        </div>
      </header>`;
    const toggle = headerRoot.querySelector(".menu-toggle");
    const links = headerRoot.querySelector(".nav-links");
    toggle?.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links?.addEventListener("click", () => {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  }

  function renderFooter(content, config) {
    const socials = Object.values(config.socials || {});
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-row">
          <div>${esc(content.footer?.note || config.profile?.name || "")}</div>
          <div class="footer-links">
            ${socials.map(s => `<a href="${esc(s.href)}" ${String(s.href).startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}>${esc(s.label)}</a>`).join("")}
          </div>
        </div>
      </footer>`;
  }

  function pageIntro(title, subtitle) {
    return `<section class="page-intro"><div class="narrow"><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div></section>`;
  }

  function socialLine(config, order = []) {
    const socials = config.socials || {};
    const keys = order.length ? order : Object.keys(socials);
    return `<div class="social-line">${keys.filter(k => socials[k]).map(k => {
      const s = socials[k];
      return `<a class="social-link" href="${esc(s.href)}" ${String(s.href).startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}>${esc(s.label)} ↗</a>`;
    }).join("")}</div>`;
  }

  function projectRow(project) {
    const media = project.media?.[0];
    const repo = project.repoUrl?.replace(/\/PINNs\.png$/, "/PINNs");
    return `
      <article class="project-row" data-section="${esc(project.section || "")}">
        ${media ? `<a class="project-media" href="${esc(media.src)}" target="_blank" rel="noreferrer" aria-label="Open image for ${esc(project.title)}"><img src="${esc(media.src)}" alt="${esc(media.alt || project.title)}" loading="lazy" onerror="this.closest('.project-media').style.display='none'"></a>` : "<div></div>"}
        <div>
          <div class="project-meta">${esc(project.eyebrow || "")}${project.year ? ` · ${esc(project.year)}` : ""}</div>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description || "")}</p>
          ${(project.tags || []).length ? `<div class="tag-line">${project.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
          <div class="row-links">
            ${repo ? `<a class="text-link" href="${esc(repo)}" target="_blank" rel="noreferrer">${esc(project.repoLabel || "Repository")} ↗</a>` : ""}
            ${project.liveUrl ? `<a class="text-link" href="${esc(project.liveUrl)}" target="_blank" rel="noreferrer">${esc(project.liveLabel || "Live")} ↗</a>` : ""}
            ${(project.links || []).map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} ↗</a>`).join("")}
          </div>
        </div>
      </article>`;
  }

  function publicationRow(pub, labels = {}) {
    const authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : (pub.authors || "");
    return `
      <article class="pub-row">
        <div class="pub-year">${esc(pub.year || "")}</div>
        <div>
          <h3>${esc(pub.title)}</h3>
          <div class="pub-authors">${esc(authors)}</div>
          <div class="pub-venue">${esc(pub.venue || "")}</div>
          <div class="row-links">
            ${pub.href ? `<a class="text-link" href="${esc(pub.href)}" target="_blank" rel="noreferrer">${esc(labels.publicationLabel || "Publication")} ↗</a>` : ""}
            ${(pub.links || []).map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} ↗</a>`).join("")}
          </div>
          ${pub.notes ? `<details class="pub-details"><summary>${esc(labels.abstractLabel || "Abstract")}</summary><p>${esc(pub.notes)}</p></details>` : ""}
        </div>
      </article>`;
  }

  function sectionHeader(section) {
    return `<div class="section-head"><h2>${esc(section?.title || "")}</h2><p class="section-subtitle">${esc(section?.subtitle || "")}</p></div>`;
  }

  function renderHome(content, config, projects, publications) {
    const home = content.home || {};
    const profile = config.profile || {};
    const role = String(profile.role || "").split("\n").map(s => s.trim()).filter(Boolean).map(esc).join("<br>");
    const enabledProjects = (projects.projects || []).filter(p => p.enabled !== false);
    const selectedIds = home.selectedProjects?.ids || [];
    const selectedProjects = selectedIds.length
      ? selectedIds.map(id => enabledProjects.find(p => p.id === id)).filter(Boolean)
      : enabledProjects.slice(0, 3);
    const sortedPubs = [...publications].sort((a, b) => (b.year || 0) - (a.year || 0));
    const recent = sortedPubs.slice(0, home.recentPublications?.limit || 3);

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <h1>${esc(profile.name || "")}</h1>
            <div class="hero-role">${role}</div>
            <p class="hero-intro">${esc(home.intro || "")}</p>
            ${socialLine(config, home.socialOrder || [])}
          </div>
          <div class="hero-photo-wrap">
            <img class="hero-photo" src="${esc(config.images?.profilePhoto || "")}" alt="${esc(profile.name || "")}" onerror="this.style.display='none'">
          </div>
        </div>
      </section>

      <section class="content-section" id="about">
        <div class="container">
          ${sectionHeader(home.about)}
          <div class="about-copy">${(home.about?.body || []).map(p => `<p>${esc(p)}</p>`).join("")}</div>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          ${sectionHeader(home.selectedProjects)}
          <div class="project-list">${selectedProjects.map(projectRow).join("")}</div>
          <div class="row-links"><a class="text-link" href="projects.html">${esc(content.navigation?.find(n => n.id === "projects")?.label || "Projects")} →</a></div>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          ${sectionHeader(home.recentPublications)}
          <div class="pub-list">${recent.map(pub => publicationRow(pub, content.publications || {})).join("")}</div>
          <div class="row-links"><a class="text-link" href="publications.html">${esc(content.navigation?.find(n => n.id === "publications")?.label || "Publications")} →</a></div>
        </div>
      </section>`;
  }

  function splitNotes(text = "") {
    const normalized = String(text).replace(/\r/g, "").trim();
    if (!normalized) return [];
    const bulletParts = normalized.split(/\n\s*\n|\n(?=•)/).map(s => s.trim()).filter(Boolean);
    if (bulletParts.length > 1 || bulletParts.some(s => s.startsWith("•"))) {
      return bulletParts.map(s => s.replace(/^•\s*/, "").trim()).filter(Boolean);
    }
    return [normalized];
  }

  function firstPreview(item) {
    if (item.summary) return item.summary;
    const notes = splitNotes(item.notes);
    return notes[0] || "";
  }

  function externalLinks(item, labels) {
    const links = [...(item.links || []), ...(item.thesis || [])];
    if (!links.length) return "";
    return `<div class="detail-block"><h4>${esc(labels.links || "Links")}</h4><div class="row-links">${links.map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} ↗</a>`).join("")}</div></div>`;
  }

  function honoursBlock(item, labels) {
    const honours = item.honors || [];
    if (!honours.length) return "";
    return `<div class="detail-block"><h4>${esc(labels.honours || "Honours")}</h4>${honours.map(h => `
      <div class="honour-row">
        <strong>${esc(h.title || "")}</strong><span>${esc(h.date || "")}</span>
        ${h.description ? `<p>${esc(h.description)}</p>` : ""}
      </div>`).join("")}</div>`;
  }

  function courseworkBlock(item, labels) {
    const exams = item.exams || [];
    if (!exams.length) return "";
    return `<div class="detail-block"><details class="coursework"><summary>${esc(labels.coursework || "Coursework")} (${exams.length})</summary><div class="course-list">${exams.map(exam => `
      <div class="course-row">
        <div>${esc(exam.name || "")}</div>
        <div class="course-grade">${esc(exam.gradeLabel || "")}</div>
        <div class="course-credits">${exam.credits ? `${esc(exam.credits)} ${esc(labels.credits || "credits")}` : ""}</div>
        ${(exam.repos || []).length ? `<div class="course-repos">${exam.repos.map(repo => `<a class="text-link" href="${esc(repo.url)}" target="_blank" rel="noreferrer">${esc(repo.label)} ↗</a>`).join("")}</div>` : ""}
      </div>`).join("")}</div></details></div>`;
  }

  function galleryBlock(item, labels) {
    const images = (item.images || []).filter(Boolean);
    if (!images.length) return "";
    return `<div class="detail-block"><h4>${esc(labels.gallery || "Images")}</h4><div class="cv-gallery">${images.map((src, i) => `<a href="${esc(src)}" target="_blank" rel="noreferrer"><img src="${esc(src)}" alt="${esc(item.title || item.organization || item.institution || "")} ${i + 1}" loading="lazy" onerror="this.parentElement.style.display='none'"></a>`).join("")}</div></div>`;
  }

  function cvEntry(item, labels) {
    const org = item.organization || item.institution || item.type || "";
    const notes = splitNotes(item.notes);
    const preview = firstPreview(item);
    const hasDetails = notes.length > 0 || (item.honors || []).length > 0 || (item.exams || []).length > 0 || (item.links || []).length > 0 || (item.thesis || []).length > 0 || (item.images || []).length > 0;
    const detailsNotes = notes.length ? `<ul>${notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : "";
    return `
      <article class="cv-entry">
        ${item.organizationImage ? `<img class="cv-logo" src="${esc(item.organizationImage)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;cv-logo-placeholder&quot;></span>'">` : `<span class="cv-logo-placeholder"></span>`}
        <div>
          <div class="cv-meta">${esc(item.period || "")}${item.location ? ` · ${esc(item.location)}` : ""}</div>
          <h3>${esc(item.title || org)}</h3>
          <div class="cv-org">${esc(org)}</div>
          ${item.finalGrade ? `<div class="cv-meta">${esc(item.finalGrade)}</div>` : ""}
          ${preview ? `<p class="cv-preview">${esc(preview)}</p>` : ""}
          ${hasDetails ? `<details class="cv-details"><summary>${esc(labels.details || "Show details")}</summary><div class="cv-details-content">
            ${detailsNotes}
            ${honoursBlock(item, labels)}
            ${externalLinks(item, labels)}
            ${courseworkBlock(item, labels)}
            ${galleryBlock(item, labels)}
          </div></details>` : ""}
        </div>
      </article>`;
  }

  function renderLanguages(items) {
    return `<div class="language-list">${items.map(item => `
      <div class="language-row">
        ${item.organizationImage ? `<img src="${esc(item.organizationImage)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : "<span></span>"}
        <div><strong>${esc(item.organization || "")}</strong>${item.title ? `<div class="cv-meta">${esc(item.title)}</div>` : ""}</div>
        <span>${esc(item.location || item.period || "")}</span>
      </div>`).join("")}</div>`;
  }

  function renderCV(content, about) {
    const cv = content.cv || {};
    const sections = cv.sections || {};
    const labels = cv.labels || {};
    const groups = {
      experience: about.experience || [],
      education: about.education || [],
      other: about.otherExperiences || [],
      languages: about.languageSkills || []
    };

    main.innerHTML = `
      ${pageIntro(cv.title || "CV", cv.subtitle || "")}
      <section class="cv-page"><div class="narrow">
        <div class="filter-bar" aria-label="CV filters">
          ${(cv.filters || []).map(f => `<button class="filter-btn ${f.id === "all" ? "active" : ""}" type="button" data-cv-filter="${esc(f.id)}">${esc(f.label)}</button>`).join("")}
        </div>
        ${["experience", "education", "other"].map(key => `
          <section class="cv-section" data-cv-section="${key}">
            <div class="cv-section-head"><h2>${esc(sections[key]?.title || key)}</h2><p>${esc(sections[key]?.subtitle || "")}</p></div>
            <div class="cv-list">${groups[key].map(item => cvEntry(item, labels)).join("")}</div>
          </section>`).join("")}
        <section class="cv-section" data-cv-section="languages">
          <div class="cv-section-head"><h2>${esc(sections.languages?.title || "Languages")}</h2><p>${esc(sections.languages?.subtitle || "")}</p></div>
          ${renderLanguages(groups.languages)}
        </section>
      </div></section>`;

    document.querySelectorAll("[data-cv-filter]").forEach(button => button.addEventListener("click", () => {
      const value = button.dataset.cvFilter;
      document.querySelectorAll("[data-cv-filter]").forEach(b => b.classList.toggle("active", b === button));
      document.querySelectorAll("[data-cv-section]").forEach(section => {
        section.hidden = value !== "all" && section.dataset.cvSection !== value;
      });
    }));
  }

  function renderPublications(content, publications) {
    const copy = content.publications || {};
    const sorted = [...publications].sort((a, b) => (b.year || 0) - (a.year || 0));
    main.innerHTML = `
      ${pageIntro(copy.title || "Publications", copy.subtitle || "")}
      <section class="content-section"><div class="narrow"><div class="pub-list">${sorted.map(pub => publicationRow(pub, copy)).join("")}</div></div></section>`;
  }

  function renderProjects(content, projects) {
    const copy = content.projects || {};
    const enabled = (projects.projects || []).filter(p => p.enabled !== false)
      .sort((a, b) => {
        if ((a.section || "") !== (b.section || "")) return (a.section || "").localeCompare(b.section || "");
        return (a.order || 999) - (b.order || 999);
      });
    const sections = (projects.sections || []).slice().sort((a, b) => (a.order || 999) - (b.order || 999));

    main.innerHTML = `
      ${pageIntro(copy.title || projects.settings?.title || "Projects", copy.subtitle || projects.settings?.subtitle || "")}
      <section class="content-section"><div class="container">
        <div class="filter-bar">
          <button class="filter-btn active" type="button" data-project-filter="all">${esc(copy.allLabel || "All")}</button>
          ${sections.map(s => `<button class="filter-btn" type="button" data-project-filter="${esc(s.id)}">${esc(s.title)}</button>`).join("")}
        </div>
        <div class="project-list">${enabled.map(projectRow).join("")}</div>
      </div></section>`;

    document.querySelectorAll("[data-project-filter]").forEach(button => button.addEventListener("click", () => {
      const value = button.dataset.projectFilter;
      document.querySelectorAll("[data-project-filter]").forEach(b => b.classList.toggle("active", b === button));
      document.querySelectorAll(".project-row").forEach(row => {
        row.hidden = value !== "all" && row.dataset.section !== value;
      });
    }));
  }

  async function init() {
    try {
      const [content, config] = await Promise.all([
        getJSON("data/content.json"),
        getJSON("data/site-config.json")
      ]);
      renderHeader(content, config);
      renderFooter(content, config);

      if (page === "home") {
        const [projects, publications] = await Promise.all([
          getJSON("data/projects.json"),
          getJSON("data/publications.json")
        ]);
        renderHome(content, config, projects, publications);
      } else if (page === "cv") {
        renderCV(content, await getJSON("data/about.json"));
      } else if (page === "publications") {
        renderPublications(content, await getJSON("data/publications.json"));
      } else if (page === "projects") {
        renderProjects(content, await getJSON("data/projects.json"));
      }
    } catch (error) {
      console.error(error);
      if (main) main.innerHTML = `<div class="narrow empty-state">Portfolio data could not be loaded.</div>`;
    }
  }

  init();
})();
