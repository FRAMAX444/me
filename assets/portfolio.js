(() => {
  "use strict";

  const page = document.body.dataset.page || "home";
  const main = document.getElementById("main");
  const headerRoot = document.getElementById("site-header");
  const footerRoot = document.getElementById("site-footer");
  const modalRoot = document.getElementById("modal-root");

  const NAV = [
    ["home", "Home", "index.html"],
    ["about", "About", "about.html"],
    ["cv", "CV & Experience", "cv.html"],
    ["publications", "Publications", "publications.html"],
    ["projects", "Projects", "projects.html"]
  ];

  const cache = new Map();
  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  async function getJSON(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path, { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error(`Could not load ${path}`);
      return response.json();
    });
    cache.set(path, promise);
    return promise;
  }

  function renderHeader() {
    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="nav-shell">
          <a class="brand" href="index.html" aria-label="Francesco Marrocco home">
            <span class="brand-mark">FM / 26</span>
            <span>Francesco Marrocco</span>
          </a>
          <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span></button>
          <nav class="nav-links" aria-label="Primary navigation">
            ${NAV.map(([id, label, href]) => `<a class="nav-link ${id === page ? "active" : ""}" href="${href}" ${id === page ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
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

  function renderFooter(config = {}) {
    const links = Object.values(config.socials || {}).slice(0, 5).map(s =>
      `<a href="${esc(s.href)}" target="${String(s.href).startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer">${esc(s.label)}</a>`
    ).join("");

    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-row">
          <div>© ${new Date().getFullYear()} Francesco Marrocco · Mathematics, AI & research.</div>
          <div class="footer-links">${links}</div>
        </div>
      </footer>`;
  }

  function indexedEyebrow(index, text) {
    return `<div class="eyebrow"><span class="index">${esc(index)}</span>${esc(text)}</div>`;
  }

  function pageHero(index, kicker, title, lede) {
    return `
      <section class="page-hero">
        <div class="container page-hero-grid">
          <div>${indexedEyebrow(index, kicker)}</div>
          <div>
            <h1>${title}</h1>
            <p class="lede">${esc(lede)}</p>
          </div>
        </div>
      </section>`;
  }

  function projectRow(project, index) {
    const media = project.media?.[0];
    const repoUrl = project.repoUrl?.replace(/\/PINNs\.png$/, "/PINNs");
    return `
      <article class="project-row reveal" data-section="${esc(project.section || "")}">
        <div class="project-number">${String(index + 1).padStart(2, "0")}</div>
        <div class="project-media" ${media ? "" : "hidden"}>
          ${media ? `<img src="${esc(media.src)}" alt="${esc(media.alt || project.title)}" loading="lazy" onerror="this.closest('.project-media').hidden=true">` : ""}
        </div>
        <div class="project-body">
          <div class="kicker">${esc(project.eyebrow || project.status || "Project")}${project.year ? ` · ${esc(project.year)}` : ""}</div>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description || "")}</p>
          <div class="tags">${(project.tags || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join("")}</div>
          <div class="project-links">
            ${repoUrl ? `<a class="action-link" href="${esc(repoUrl)}" target="_blank" rel="noreferrer">Repository <span class="arrow">↗</span></a>` : ""}
            ${project.liveUrl ? `<a class="action-link" href="${esc(project.liveUrl)}" target="_blank" rel="noreferrer">${esc(project.liveLabel || "Live site")} <span class="arrow">↗</span></a>` : ""}
            ${(project.links || []).map(link => `<a class="action-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="arrow">↗</span></a>`).join("")}
          </div>
        </div>
      </article>`;
  }

  function publicationRow(pub, compact = false) {
    const authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : (pub.authors || "");
    if (compact) {
      return `
        <article class="pub-row reveal">
          <div class="pub-year">${esc(pub.year || "")}</div>
          <div class="pub-main">
            <h3>${esc(pub.title)}</h3>
            <div class="pub-authors">${esc(authors)}</div>
            <div class="pub-venue">${esc(pub.venue || "")}</div>
          </div>
          <div class="pub-actions">
            ${pub.href ? `<a class="action-link" href="${esc(pub.href)}" target="_blank" rel="noreferrer">View <span class="arrow">↗</span></a>` : ""}
          </div>
        </article>`;
    }

    return `
      <article class="pub-row reveal">
        <div class="pub-year">${esc(pub.year || "")}</div>
        <div class="pub-main">
          <h3>${esc(pub.title)}</h3>
          <div class="pub-authors">${esc(authors)}</div>
          <div class="pub-venue">${esc(pub.venue || "")}</div>
        </div>
        <div class="pub-actions">
          ${pub.href ? `<a class="action-link" href="${esc(pub.href)}" target="_blank" rel="noreferrer">Publication <span class="arrow">↗</span></a>` : ""}
          ${(pub.links || []).map(link => `<a class="action-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="arrow">↗</span></a>`).join("")}
        </div>
        ${pub.notes ? `<details class="pub-details"><summary>Read abstract & details</summary><p>${esc(pub.notes)}</p></details>` : ""}
      </article>`;
  }

  async function githubStats(username) {
    const fallback = { public_repos: "—", followers: "—", following: "—", stars: "—", repos: [] };
    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`)
      ]);
      if (!profileRes.ok || !reposRes.ok) return fallback;
      const profile = await profileRes.json();
      const repos = await reposRes.json();
      return {
        public_repos: profile.public_repos ?? repos.length,
        followers: profile.followers ?? 0,
        following: profile.following ?? 0,
        stars: repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
        repos: repos.filter(repo => !repo.fork).slice(0, 5)
      };
    } catch {
      return fallback;
    }
  }

  function statsMarkup(stats) {
    return `
      <div class="stats-line">
        <div class="stat-inline"><strong>${esc(stats.public_repos)}</strong><span>Public repositories</span></div>
        <div class="stat-inline"><strong>${esc(stats.stars)}</strong><span>Stars</span></div>
        <div class="stat-inline"><strong>${esc(stats.followers)}</strong><span>Followers</span></div>
        <div class="stat-inline"><strong>${esc(stats.following)}</strong><span>Following</span></div>
      </div>
      ${stats.repos?.length ? `<div class="repo-list">${stats.repos.slice(0, 4).map(repo => `
        <a class="repo-row" href="${esc(repo.html_url)}" target="_blank" rel="noreferrer">
          <strong>${esc(repo.name)}</strong>
          <span>${esc(repo.language || "Repository")} · ★ ${esc(repo.stargazers_count || 0)}</span>
          <span class="repo-arrow">↗</span>
        </a>`).join("")}</div>` : ""}`;
  }

  async function renderHome(config, projects, publications) {
    const profile = config.profile || {};
    const selectedProjects = (projects.projects || []).filter(p => p.enabled !== false).slice(0, 4);
    const selectedPubs = [...publications].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 3);

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            ${indexedEyebrow("01", "Applied mathematics · AI · research")}
            <h1 class="hero-title">
              <span class="line">I work where</span>
              <span class="line">mathematics, AI</span>
              <span class="line">and <span class="accent-word">physical systems</span> meet.</span>
            </h1>
            <p class="hero-role">Francesco Marrocco — MSc student in Applied Mathematics to Artificial Intelligence, researcher in explainable machine learning for seismology, and conference operations staff at FAO.</p>
            <div class="hero-actions">
              <a class="action-link" href="projects.html">Selected work <span class="arrow">→</span></a>
              <a class="action-link" href="publications.html">Research output <span class="arrow">→</span></a>
              <a class="action-link" href="cv.html">Curriculum <span class="arrow">→</span></a>
            </div>
            <div class="hero-meta">
              <span>Rome, Italy</span>
              <span>Explainable AI · Seismology · Scientific ML</span>
            </div>
          </div>
          <figure class="hero-portrait reveal">
            <img class="hero-photo" src="${esc(config.images?.profilePhoto)}" alt="Francesco Marrocco" onerror="this.style.display='none'">
            <figcaption class="photo-caption"><span>Francesco Marrocco</span><span>2026</span></figcaption>
          </figure>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>${indexedEyebrow("02", "Practice")}<h2>Three threads, one way of <span class="display-serif">thinking.</span></h2></div>
          </div>
          <div class="editorial-grid">
            <article class="editorial-item reveal"><span class="editorial-index">A / 01</span><h3>Explainable AI</h3><p>Interpretable CNNs, SHAP and time–frequency representations used to extract physically meaningful information from seismic signals.</p><a class="text-link" href="publications.html">Research <span class="arrow">→</span></a></article>
            <article class="editorial-item reveal"><span class="editorial-index">A / 02</span><h3>Applied mathematics</h3><p>Probability, numerical methods, differential equations, stochastic processes and scientific computing as a foundation for machine learning.</p><a class="text-link" href="cv.html">Education <span class="arrow">→</span></a></article>
            <article class="editorial-item reveal"><span class="editorial-index">A / 03</span><h3>Software & operations</h3><p>Research tooling, data products and small automation systems designed around real operational constraints and human workflows.</p><a class="text-link" href="projects.html">Projects <span class="arrow">→</span></a></article>
          </div>
        </div>
      </section>

      <section class="section alt">
        <div class="container">
          <div class="section-head">
            <div>${indexedEyebrow("03", "Selected work")}<h2>Projects with <span class="display-serif">context.</span></h2></div>
            <a class="text-link" href="projects.html">View all projects <span class="arrow">→</span></a>
          </div>
          <div class="project-list">${selectedProjects.map(projectRow).join("")}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>${indexedEyebrow("04", "Research output")}<h2>Recent publications.</h2></div>
            <a class="text-link" href="publications.html">Full list <span class="arrow">→</span></a>
          </div>
          <div class="pub-list">${selectedPubs.map(pub => publicationRow(pub, true)).join("")}</div>
        </div>
      </section>

      <section class="section alt">
        <div class="container">
          <div class="section-head">
            <div>${indexedEyebrow("05", "Open source")}<h2>GitHub, without the dashboard aesthetic.</h2></div>
            <a class="text-link" href="https://github.com/${esc(profile.githubUsername || "FRAMAX444")}" target="_blank" rel="noreferrer">GitHub profile <span class="arrow">↗</span></a>
          </div>
          <div id="github-stats"><div class="empty-state">Loading GitHub activity…</div></div>
        </div>
      </section>

      <section class="section compact">
        <div class="container cta-editorial">
          <div>${indexedEyebrow("06", "Contact")}</div>
          <div><h2>Research, technical work, or simply an interesting problem.</h2><p>If there is a useful overlap between what you are working on and what I do, the About page has the best ways to reach me.</p><a class="action-link" href="about.html">Contact & links <span class="arrow">→</span></a></div>
        </div>
      </section>`;

    const statRoot = document.getElementById("github-stats");
    githubStats(profile.githubUsername || "FRAMAX444").then(stats => {
      if (statRoot) statRoot.innerHTML = statsMarkup(stats);
    });
  }

  async function renderAbout(config, about) {
    const socials = Object.values(config.socials || {});
    const languages = about.languageSkills || [];

    main.innerHTML = `
      ${pageHero("01", "About", "About <span class='display-serif'>me.</span>", "A short account of what I study, what I work on and the environments that shaped how I approach technical problems.")}
      <section class="section compact">
        <div class="container about-layout">
          <aside class="profile-panel reveal">
            <img src="${esc(config.images?.profilePhoto)}" alt="Francesco Marrocco" onerror="this.style.display='none'">
            <div class="profile-caption">Francesco Marrocco · Rome, Italy</div>
          </aside>
          <div class="about-copy">
            ${indexedEyebrow("A", "Profile")}
            <p>I am pursuing an MSc in Applied Mathematics to Artificial Intelligence at Sapienza University of Rome. My research focuses on explainable machine learning for seismic data: building models that are not only accurate, but whose decisions can be connected back to the physics of the signal.</p>
            <p>Alongside research and university, I work in conference operations at the Food and Agriculture Organization of the United Nations. That combination has made me value systems that are mathematically sound, technically reliable and usable by real people under real constraints.</p>
            <blockquote class="pullquote">${esc(config.profile?.homeQuote || "")}</blockquote>
            <div class="focus-list">
              <div class="focus-row"><span class="focus-num">01</span><strong>Research</strong><p>Explainable AI, CNN interpretability, seismic-cycle monitoring, signal representations and scientific machine learning.</p></div>
              <div class="focus-row"><span class="focus-num">02</span><strong>Mathematics</strong><p>Probability, algebra, geometry, numerical analysis, stochastic processes and differential equations.</p></div>
              <div class="focus-row"><span class="focus-num">03</span><strong>Execution</strong><p>Operational coordination, conference technology, workflow design and automation in international environments.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section alt">
        <div class="container">
          <div class="section-head"><div>${indexedEyebrow("02", "Contact")}<h2>Find me <span class="display-serif">online.</span></h2></div></div>
          <div class="contact-list">
            ${socials.map(s => `<a class="contact-row" href="${esc(s.href)}" target="${String(s.href).startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer"><strong>${esc(s.label)}</strong><span>${esc(s.handle)}</span><b>↗</b></a>`).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head"><div>${indexedEyebrow("03", "Languages")}<h2>Communication.</h2></div></div>
          <div class="language-list">
            ${languages.map(lang => `<div class="language-row">${lang.organizationImage ? `<img src="${esc(lang.organizationImage)}" alt="" onerror="this.style.display='none'">` : `<span></span>`}<strong>${esc(lang.organization)}</strong><span>${esc([lang.title, lang.location, lang.period].filter(Boolean).join(" · "))}</span></div>`).join("")}
          </div>
        </div>
      </section>

      <section class="section compact alt">
        <div class="container cta-editorial">
          <div>${indexedEyebrow("04", "CV")}</div>
          <div><h2>The complete timeline, not just the highlights.</h2><p>Work, university, fellowships, leadership, honours, exams and related material are organised chronologically and can be opened for detail.</p><a class="action-link" href="cv.html">CV & Experience <span class="arrow">→</span></a></div>
        </div>
      </section>`;
  }

  function timelineRow(item, category, index) {
    const org = item.organization || item.institution || item.type || "";
    return `
      <button class="timeline-row reveal" type="button" data-category="${esc(category)}" data-detail-category="${esc(category)}" data-detail-index="${index}" aria-label="Open details for ${esc(item.title || org)}">
        <span class="timeline-period">${esc(item.period || item.location || "")}</span>
        <span class="timeline-content">
          <span class="timeline-title">${esc(item.title || org)}</span>
          <span class="timeline-org">${esc(org)}</span>
          ${item.location && item.period ? `<span class="timeline-location">${esc(item.location)}</span>` : ""}
          ${item.finalGrade ? `<span class="grade-badge">${esc(item.finalGrade)}</span>` : ""}
        </span>
        <span class="timeline-open">＋</span>
      </button>`;
  }

  function renderCV(about) {
    const groups = {
      experience: about.experience || [],
      education: about.education || [],
      other: about.otherExperiences || [],
      languages: about.languageSkills || []
    };

    main.innerHTML = `
      ${pageHero("01", "CV & Experience", "Work, study <span class='display-serif'>& research.</span>", "A navigable record of professional experience, education, fellowships, leadership and languages. Open any item for images, responsibilities, honours, exams and related links.")}
      <section class="section compact">
        <div class="container">
          <div class="cv-summary">
            <div class="cv-fact"><strong>110L</strong><span>BSc Mathematical Sciences for AI</span></div>
            <div class="cv-fact"><strong>MSc</strong><span>Applied Mathematics to AI · in progress</span></div>
            <div class="cv-fact"><strong>FAO</strong><span>Conference operations · since 2023</span></div>
            <div class="cv-fact"><strong>C2</strong><span>Cambridge English Proficiency</span></div>
          </div>
          <div class="filter-bar" aria-label="CV filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="experience">Work</button>
            <button class="filter-btn" data-filter="education">Education & leadership</button>
            <button class="filter-btn" data-filter="other">Fellowships & other</button>
            <button class="filter-btn" data-filter="languages">Languages</button>
          </div>
          <div class="timeline">
            ${groups.experience.map((item, i) => timelineRow(item, "experience", i)).join("")}
            ${groups.education.map((item, i) => timelineRow(item, "education", i)).join("")}
            ${groups.other.map((item, i) => timelineRow(item, "other", i)).join("")}
            ${groups.languages.map((item, i) => timelineRow(item, "languages", i)).join("")}
          </div>
        </div>
      </section>`;

    document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(button => button.classList.toggle("active", button === btn));
      const value = btn.dataset.filter;
      document.querySelectorAll(".timeline-row").forEach(item => {
        item.hidden = value !== "all" && item.dataset.category !== value;
      });
    }));

    document.querySelectorAll("[data-detail-category]").forEach(button => button.addEventListener("click", () => {
      const selected = groups[button.dataset.detailCategory]?.[Number(button.dataset.detailIndex)];
      openDetail(selected);
    }));
  }

  function allLinks(item) {
    return [...(item.links || []), ...(item.thesis || [])];
  }

  function openDetail(item) {
    if (!item) return;
    const org = item.organization || item.institution || item.type || "";
    const images = (item.images || []).filter(Boolean);
    const exams = item.exams || [];
    const honors = item.honors || [];
    const links = allLinks(item);

    modalRoot.innerHTML = `
      <div class="modal-backdrop" role="presentation">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-head">
            <div><div class="kicker">${esc(item.period || item.type || "Details")}</div><strong id="modal-title">${esc(item.title || org)}</strong></div>
            <button class="modal-close" type="button" aria-label="Close details">×</button>
          </div>
          <div class="modal-content">
            <div class="modal-grid">
              <div>
                ${images.length ? `<div class="modal-gallery"><img class="gallery-main" src="${esc(images[0])}" alt="${esc(item.title || org)}" onerror="this.style.display='none'">${images.length > 1 ? `<div class="thumb-row">${images.slice(0, 8).map((src, i) => `<button class="thumb ${i === 0 ? "active" : ""}" type="button" data-gallery-src="${esc(src)}"><img src="${esc(src)}" alt="" onerror="this.parentElement.style.display='none'"></button>`).join("")}</div>` : ""}</div>` : item.organizationImage ? `<img class="gallery-main" src="${esc(item.organizationImage)}" alt="${esc(org)}" onerror="this.style.display='none'">` : ""}
              </div>
              <div>
                <section class="detail-section">
                  ${indexedEyebrow("A", "Overview")}
                  <h2>${esc(item.title || org)}</h2>
                  <dl class="detail-meta">
                    ${org ? `<dt>Organisation</dt><dd>${esc(org)}</dd>` : ""}
                    ${item.period ? `<dt>Period</dt><dd>${esc(item.period)}</dd>` : ""}
                    ${item.location ? `<dt>Location</dt><dd>${esc(item.location)}</dd>` : ""}
                    ${item.finalGrade ? `<dt>Final grade</dt><dd>${esc(item.finalGrade)}</dd>` : ""}
                  </dl>
                  ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
                  ${item.notes ? `<p>${esc(item.notes)}</p>` : ""}
                  ${links.length ? `<div class="inline-actions">${links.map(link => `<a class="action-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="arrow">↗</span></a>`).join("")}</div>` : ""}
                </section>
                ${honors.length ? `<section class="detail-section"><h3>Honours & recognition</h3>${honors.map(h => `<div class="honor"><strong>${esc(h.title)}</strong><span>${esc(h.date || "")}</span><p>${esc(h.description || "")}</p></div>`).join("")}</section>` : ""}
                ${exams.length ? `<section class="detail-section"><h3>Coursework & exams</h3><div class="exam-list">${exams.map(exam => `<div class="exam"><strong>${esc(exam.name)}</strong><span>${esc(exam.gradeLabel || "")}</span><span>${exam.credits ? `${esc(exam.credits)} credits` : ""}</span>${(exam.repos || []).length ? `<div class="exam-links">${exam.repos.map(repo => `<a class="text-link" href="${esc(repo.url)}" target="_blank" rel="noreferrer">${esc(repo.label)} <span class="arrow">↗</span></a>`).join("")}</div>` : ""}</div>`).join("")}</div></section>` : ""}
              </div>
            </div>
          </div>
        </section>
      </div>`;

    document.body.classList.add("modal-open");
    const backdrop = modalRoot.querySelector(".modal-backdrop");
    const close = modalRoot.querySelector(".modal-close");
    const dismiss = () => {
      modalRoot.innerHTML = "";
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
    const onKey = event => {
      if (event.key === "Escape" && modalRoot.innerHTML) dismiss();
    };

    close?.focus();
    close?.addEventListener("click", dismiss);
    backdrop?.addEventListener("click", event => {
      if (event.target === backdrop) dismiss();
    });
    document.addEventListener("keydown", onKey);

    modalRoot.querySelectorAll("[data-gallery-src]").forEach(thumb => thumb.addEventListener("click", () => {
      const image = modalRoot.querySelector(".gallery-main");
      if (image) {
        image.style.display = "";
        image.src = thumb.dataset.gallerySrc;
      }
      modalRoot.querySelectorAll(".thumb").forEach(item => item.classList.toggle("active", item === thumb));
    }));
  }

  function renderPublications(publications) {
    const sorted = [...publications].sort((a, b) => (b.year || 0) - (a.year || 0));
    main.innerHTML = `
      ${pageHero("01", "Publications", "Research, made <span class='display-serif'>legible.</span>", "Publications and conference contributions at the intersection of machine learning, interpretability and seismology, with direct links to papers, abstracts and presentation material.")}
      <section class="section compact">
        <div class="container">
          <div class="section-head"><div>${indexedEyebrow("02", "Research output")}<h2>${sorted.length} selected outputs.</h2></div></div>
          <div class="pub-list">${sorted.map(pub => publicationRow(pub)).join("")}</div>
        </div>
      </section>`;
  }

  async function renderProjects(config, projects) {
    const active = (projects.projects || []).filter(project => project.enabled !== false);
    main.innerHTML = `
      ${pageHero("01", "Projects", "Projects with a <span class='display-serif'>reason to exist.</span>", "Research code, technical experiments and working products across explainable AI, scientific machine learning, numerical methods and practical data tools.")}
      <section class="section compact">
        <div class="container">
          <div class="filter-bar" aria-label="Project filters">
            <button class="filter-btn active" data-project-filter="all">All</button>
            <button class="filter-btn" data-project-filter="current">Current</button>
            <button class="filter-btn" data-project-filter="past">Past</button>
          </div>
          <div class="project-list">${active.map(projectRow).join("")}</div>
        </div>
      </section>
      <section class="section alt">
        <div class="container">
          <div class="section-head">
            <div>${indexedEyebrow("02", "GitHub")}<h2>Code & repositories.</h2></div>
            <a class="text-link" href="https://github.com/${esc(config.profile?.githubUsername || "FRAMAX444")}" target="_blank" rel="noreferrer">Open GitHub <span class="arrow">↗</span></a>
          </div>
          <div id="github-stats"><div class="empty-state">Loading GitHub activity…</div></div>
        </div>
      </section>`;

    document.querySelectorAll("[data-project-filter]").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll("[data-project-filter]").forEach(button => button.classList.toggle("active", button === btn));
      const value = btn.dataset.projectFilter;
      document.querySelectorAll(".project-row").forEach(row => {
        row.hidden = value !== "all" && row.dataset.section !== value;
      });
    }));

    const statRoot = document.getElementById("github-stats");
    githubStats(config.profile?.githubUsername || "FRAMAX444").then(stats => {
      if (statRoot) statRoot.innerHTML = statsMarkup(stats);
    });
  }

  function observeReveals() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(item => item.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: .06 });
    items.forEach(item => observer.observe(item));
  }

  async function init() {
    renderHeader();
    try {
      const config = await getJSON("data/site-config.json");
      renderFooter(config);
      if (page === "home") {
        const [projects, publications] = await Promise.all([getJSON("data/projects.json"), getJSON("data/publications.json")]);
        await renderHome(config, projects, publications);
      } else if (page === "about") {
        await renderAbout(config, await getJSON("data/about.json"));
      } else if (page === "cv") {
        renderCV(await getJSON("data/about.json"));
      } else if (page === "publications") {
        renderPublications(await getJSON("data/publications.json"));
      } else if (page === "projects") {
        await renderProjects(config, await getJSON("data/projects.json"));
      }
      observeReveals();
    } catch (error) {
      console.error(error);
      main.innerHTML = `<section class="section"><div class="container"><div class="empty-state"><div><h2>Portfolio data could not be loaded.</h2><p>Please refresh the page.</p></div></div></div></section>`;
    }
  }

  init();
})();
