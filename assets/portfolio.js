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
    const promise = fetch(path, { cache: "no-store" }).then(async (response) => {
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
            <span class="brand-mark">FM</span>
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
    const links = Object.values(config.socials || {}).slice(0, 5).map((s) =>
      `<a href="${esc(s.href)}" target="_blank" rel="noreferrer">${esc(s.label)}</a>`
    ).join("");
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-row">
          <div>© ${new Date().getFullYear()} Francesco Marrocco. Built as a focused research & engineering portfolio.</div>
          <div class="footer-links">${links}</div>
        </div>
      </footer>`;
  }

  function heroBlock(kicker, title, lede) {
    return `<section class="page-hero"><div class="container"><div class="eyebrow">${esc(kicker)}</div><h1>${title}</h1><p class="lede">${esc(lede)}</p></div></section>`;
  }

  function iconCard(icon, title, body, href, label) {
    return `<article class="card reveal"><div class="icon-box">${icon}</div><h3>${esc(title)}</h3><p class="muted">${esc(body)}</p>${href ? `<a class="text-link" href="${href}">${esc(label || "Explore")} <span class="arrow">→</span></a>` : ""}</article>`;
  }

  function projectCard(project) {
    const media = project.media?.[0];
    const repoUrl = project.repoUrl?.replace(/\/PINNs\.png$/, "/PINNs");
    return `
      <article class="project-card reveal" data-section="${esc(project.section || "")}">
        ${media ? `<div class="project-media"><img src="${esc(media.src)}" alt="${esc(media.alt || project.title)}" loading="lazy" onerror="this.closest('.project-media').style.display='none'"></div>` : ""}
        <div class="project-body">
          <div class="eyebrow">${esc(project.eyebrow || project.status || "Project")}</div>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description || "")}</p>
          <div class="tags">${(project.tags || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join("")}</div>
          <div class="project-links">
            ${repoUrl ? `<a class="btn" href="${esc(repoUrl)}" target="_blank" rel="noreferrer">GitHub <span class="arrow">↗</span></a>` : ""}
            ${project.liveUrl ? `<a class="btn primary" href="${esc(project.liveUrl)}" target="_blank" rel="noreferrer">${esc(project.liveLabel || "Live")} <span class="arrow">↗</span></a>` : ""}
            ${(project.links || []).map(link => `<a class="btn ghost" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")}</a>`).join("")}
          </div>
        </div>
      </article>`;
  }

  function publicationCard(pub, compact = false) {
    const authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors || "";
    if (compact) {
      return `<article class="card reveal"><div class="kicker">${esc(pub.venue || "")} · ${esc(pub.year || "")}</div><h3>${esc(pub.title)}</h3><p class="muted">${esc(authors)}</p><a class="text-link" href="${esc(pub.href)}" target="_blank" rel="noreferrer">View publication <span class="arrow">↗</span></a></article>`;
    }
    return `
      <article class="pub-card reveal">
        <div class="pub-top"><div><h3>${esc(pub.title)}</h3><div class="pub-authors">${esc(authors)}</div><div class="pub-venue">${esc(pub.venue || "")}</div></div><span class="pub-year">${esc(pub.year || "")}</span></div>
        <div class="inline-actions">
          ${pub.href ? `<a class="btn primary" href="${esc(pub.href)}" target="_blank" rel="noreferrer">Publication <span class="arrow">↗</span></a>` : ""}
          ${(pub.links || []).map(link => `<a class="btn" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="arrow">↗</span></a>`).join("")}
        </div>
        ${pub.notes ? `<details class="pub-details"><summary>Abstract & details</summary><p>${esc(pub.notes)}</p></details>` : ""}
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
        repos: repos.filter(r => !r.fork).slice(0, 6)
      };
    } catch { return fallback; }
  }

  function statsMarkup(stats) {
    return `
      <div class="stats-grid">
        <div class="stat-card"><strong>${esc(stats.public_repos)}</strong><span>Public repositories</span></div>
        <div class="stat-card"><strong>${esc(stats.stars)}</strong><span>Stars across public repos</span></div>
        <div class="stat-card"><strong>${esc(stats.followers)}</strong><span>GitHub followers</span></div>
        <div class="stat-card"><strong>${esc(stats.following)}</strong><span>Following</span></div>
      </div>
      ${stats.repos?.length ? `<div class="repo-strip">${stats.repos.slice(0, 3).map(repo => `<a class="repo-mini" href="${esc(repo.html_url)}" target="_blank" rel="noreferrer"><strong>${esc(repo.name)}</strong><span>${esc(repo.language || "Repository")} · ★ ${esc(repo.stargazers_count || 0)}</span></a>`).join("")}</div>` : ""}`;
  }

  async function renderHome(config, projects, publications) {
    const profile = config.profile || {};
    const roleLines = String(profile.role || "").split("\n").filter(Boolean);
    const selectedProjects = (projects.projects || []).filter(p => p.enabled !== false).slice(0, 4);
    const selectedPubs = [...publications].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 2);
    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">Applied Mathematics · AI · Research</div>
            <h1 class="hero-title">Francesco<br><span class="accent">Marrocco.</span></h1>
            <div class="hero-role">${roleLines.map(esc).join("<br>")}</div>
            <div class="pill-row"><span class="pill">Explainable AI</span><span class="pill">Seismology</span><span class="pill">Scientific ML</span><span class="pill">Software & automation</span></div>
            <div class="hero-actions"><a class="btn primary" href="cv.html">Explore my CV <span class="arrow">→</span></a><a class="btn" href="projects.html">View projects <span class="arrow">→</span></a><a class="btn ghost" href="publications.html">Publications</a></div>
          </div>
          <div><div class="hero-card reveal"><img class="hero-photo" src="${esc(config.images?.profilePhoto)}" alt="Francesco Marrocco" onerror="this.style.display='none'"><div class="hero-mini"><div class="mini-stat"><strong>110L</strong><span>BSc final grade</span></div><div class="mini-stat"><strong>${publications.length}</strong><span>Publications</span></div><div class="mini-stat"><strong>2023</strong><span>FAO since</span></div></div></div></div>
        </div>
      </section>
      <section class="section alt"><div class="container"><div class="section-head"><div><div class="eyebrow">What I work on</div><h2>Research with mathematical depth<br>and practical impact.</h2></div></div><div class="grid-3">
        ${iconCard("∿", "Explainable AI & Seismology", "Interpretable CNNs, SHAP and time–frequency representations for understanding seismic-cycle signals.", "publications.html", "Research & publications")}
        ${iconCard("∂", "Applied Mathematics", "Probability, numerical methods, differential equations, scientific computing and machine learning.", "cv.html", "Education & skills")}
        ${iconCard("</>", "Software & Automation", "Data products, research tooling and small applications that simplify repetitive operational workflows.", "projects.html", "Selected projects")}
      </div></div></section>
      <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Selected work</div><h2>Projects</h2></div><a class="text-link" href="projects.html">All projects <span class="arrow">→</span></a></div><div class="project-grid">${selectedProjects.map(projectCard).join("")}</div></div></section>
      <section class="section alt"><div class="container"><div class="section-head"><div><div class="eyebrow">Research output</div><h2>Latest publications</h2></div><a class="text-link" href="publications.html">All publications <span class="arrow">→</span></a></div><div class="grid-2">${selectedPubs.map(p => publicationCard(p, true)).join("")}</div></div></section>
      <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Open source</div><h2>GitHub at a glance</h2></div><a class="text-link" href="https://github.com/${esc(profile.githubUsername || "FRAMAX444")}" target="_blank" rel="noreferrer">GitHub profile <span class="arrow">↗</span></a></div><div id="github-stats"><div class="empty-state">Loading live GitHub stats…</div></div></div></section>
      <section class="section compact"><div class="container"><div class="cta reveal"><div class="eyebrow">Let’s connect</div><h2>Interested in research, AI or a technical collaboration?</h2><p>Explore my background, publications and projects, or reach out directly through the contact links in the About page.</p><div class="inline-actions"><a class="btn primary" href="about.html">Contact & socials <span class="arrow">→</span></a></div></div></div></section>`;
    const statRoot = document.getElementById("github-stats");
    githubStats(profile.githubUsername || "FRAMAX444").then(stats => { if (statRoot) statRoot.innerHTML = statsMarkup(stats); });
  }

  async function renderAbout(config, about) {
    const profile = config.profile || {};
    const socials = Object.values(config.socials || {});
    const languages = about.languageSkills || [];
    main.innerHTML = `
      ${heroBlock("About me", "Mathematics, AI, research <span class='accent'>and people.</span>", "I combine mathematical training, machine learning research and hands-on operational experience in international environments.")}
      <section class="section compact"><div class="container about-grid">
        <aside class="profile-panel reveal"><img src="${esc(config.images?.profilePhoto)}" alt="Francesco Marrocco" onerror="this.style.display='none'"><blockquote class="quote">${esc(profile.homeQuote || "")}</blockquote></aside>
        <div><div class="eyebrow">Profile</div><h2>Curious by training.<br>Practical by habit.</h2><p class="lede">I am currently pursuing an MSc in Applied Mathematics to Artificial Intelligence at Sapienza University of Rome, while working at FAO and developing research around explainable machine learning for seismic data.</p>
          <div class="topic-list"><div class="topic"><span class="topic-num">01</span><div><strong>Research</strong><div class="muted">Explainable AI, CNN interpretability, seismic-cycle monitoring and scientific machine learning.</div></div></div><div class="topic"><span class="topic-num">02</span><div><strong>Mathematics</strong><div class="muted">Probability, algebra, geometry, numerical methods, stochastic processes and differential equations.</div></div></div><div class="topic"><span class="topic-num">03</span><div><strong>Execution</strong><div class="muted">Operational coordination, conference technology, workflow design and automation in an international organization.</div></div></div></div>
          <div class="section compact" style="padding-bottom:0"><div class="section-head"><div><div class="eyebrow">Contact</div><h2>Find me online</h2></div></div><div class="social-grid">${socials.map(s => `<a class="social-card" href="${esc(s.href)}" target="${String(s.href).startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer"><img src="${esc(s.icon)}" alt="" onerror="this.style.display='none'"><div><strong>${esc(s.label)}</strong><span>${esc(s.handle)}</span></div></a>`).join("")}</div></div>
          <div class="section compact" style="padding-bottom:0"><div class="section-head"><div><div class="eyebrow">Languages</div><h2>Communication</h2></div></div><div class="grid-3">${languages.map(lang => `<article class="card">${lang.organizationImage ? `<img class="org-logo" src="${esc(lang.organizationImage)}" alt="" onerror="this.style.display='none'">` : ""}<h3>${esc(lang.organization)}</h3><p class="muted">${esc(lang.title || lang.location || "")}</p>${lang.title ? `<span class="pill">${esc(lang.location || "")}</span>` : ""}</article>`).join("")}</div></div>
        </div>
      </div></section>
      <section class="section alt"><div class="container"><div class="cta reveal"><div class="eyebrow">Professional background</div><h2>See the full timeline, exams, honours and experience details.</h2><p>The CV page turns the underlying portfolio data into a navigable timeline, with images and expandable details for each item.</p><a class="btn primary" href="cv.html">Open CV & Experience <span class="arrow">→</span></a></div></div></section>`;
  }

  function timelineItem(item, category, index) {
    const org = item.organization || item.institution || item.type || "";
    const logo = item.organizationImage;
    return `<div class="timeline-item reveal" data-category="${esc(category)}"><span class="timeline-dot"></span><button class="timeline-card" type="button" data-detail-category="${esc(category)}" data-detail-index="${index}" aria-label="Open details for ${esc(item.title || org)}">${logo ? `<img class="org-logo" src="${esc(logo)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="org-logo"></span>`}<span><span class="timeline-title">${esc(item.title || org)}</span><span class="timeline-org">${esc(org)}</span><span class="timeline-meta">${esc(item.period || "")}${item.location ? ` · ${esc(item.location)}` : ""}</span>${item.finalGrade ? `<span class="grade-badge">${esc(item.finalGrade)}</span>` : ""}</span><span class="timeline-open">＋</span></button></div>`;
  }

  function renderCV(about) {
    const groups = { experience: about.experience || [], education: about.education || [], other: about.otherExperiences || [], languages: about.languageSkills || [] };
    main.innerHTML = `
      ${heroBlock("CV & Experience", "A timeline of <span class='accent'>work, study and research.</span>", "Browse by topic, then open any item for images, detailed responsibilities, honours, exams and related links.")}
      <section class="section compact"><div class="container">
        <div class="quick-facts"><div class="fact"><strong>110L</strong><span>BSc in Mathematical Sciences for AI</span></div><div class="fact"><strong>MSc</strong><span>Applied Mathematics to AI · in progress</span></div><div class="fact"><strong>FAO</strong><span>Conference operations since 2023</span></div><div class="fact"><strong>C2</strong><span>Cambridge English Proficiency</span></div></div>
        <div class="filter-bar" aria-label="CV filters"><button class="filter-btn active" data-filter="all">All</button><button class="filter-btn" data-filter="experience">Work</button><button class="filter-btn" data-filter="education">Education & leadership</button><button class="filter-btn" data-filter="other">Fellowships & other</button><button class="filter-btn" data-filter="languages">Languages</button></div>
        <div class="timeline">${groups.experience.map((item,i)=>timelineItem(item,"experience",i)).join("")}${groups.education.map((item,i)=>timelineItem(item,"education",i)).join("")}${groups.other.map((item,i)=>timelineItem(item,"other",i)).join("")}${groups.languages.map((item,i)=>timelineItem(item,"languages",i)).join("")}</div>
      </div></section>`;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
      const value = btn.dataset.filter;
      document.querySelectorAll(".timeline-item").forEach(item => { item.hidden = value !== "all" && item.dataset.category !== value; });
    }));
    document.querySelectorAll("[data-detail-category]").forEach(button => button.addEventListener("click", () => {
      openDetail(groups[button.dataset.detailCategory]?.[Number(button.dataset.detailIndex)]);
    }));
  }

  function linkButtons(item) {
    return [...(item.links || []), ...(item.thesis || [])].map(link => `<a class="btn" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="arrow">↗</span></a>`).join("");
  }

  function openDetail(item) {
    if (!item) return;
    const org = item.organization || item.institution || item.type || "";
    const images = (item.images || []).filter(Boolean);
    const exams = item.exams || [];
    const honors = item.honors || [];
    modalRoot.innerHTML = `
      <div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head"><div><div class="kicker">${esc(item.period || item.type || "Details")}</div><strong id="modal-title">${esc(item.title || org)}</strong></div><button class="modal-close" type="button" aria-label="Close details">×</button></div>
        <div class="modal-content"><div class="modal-grid"><div>
          ${images.length ? `<div class="modal-gallery"><img class="gallery-main" src="${esc(images[0])}" alt="${esc(item.title || org)}" onerror="this.style.display='none'">${images.length > 1 ? `<div class="thumb-row">${images.slice(0,8).map((src,i)=>`<button class="thumb ${i===0?"active":""}" type="button" data-gallery-src="${esc(src)}"><img src="${esc(src)}" alt="" onerror="this.parentElement.style.display='none'"></button>`).join("")}</div>` : ""}</div>` : `<div class="card">${item.organizationImage ? `<img class="org-logo" src="${esc(item.organizationImage)}" alt="" onerror="this.style.display='none'">` : ""}<h3>${esc(org)}</h3><p class="muted">${esc(item.location || "")}</p></div>`}
        </div><div>
          <div class="detail-section"><div class="eyebrow">Overview</div><h2 style="font-size:clamp(28px,4vw,42px)">${esc(item.title || org)}</h2><p><strong>${esc(org)}</strong>${item.location ? `<br>${esc(item.location)}` : ""}</p>${item.finalGrade ? `<span class="pill">${esc(item.finalGrade)}</span>` : ""}${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.notes ? `<p>${esc(item.notes)}</p>` : ""}${linkButtons(item) ? `<div class="inline-actions">${linkButtons(item)}</div>` : ""}</div>
          ${honors.length ? `<div class="detail-section"><h3>Honours & recognition</h3>${honors.map(h=>`<div class="honor"><strong>${esc(h.title)}</strong><span>${esc(h.date || "")}</span><p>${esc(h.description || "")}</p></div>`).join("")}</div>` : ""}
          ${exams.length ? `<div class="detail-section"><h3>Selected coursework & exams</h3><div class="exam-grid">${exams.map(exam=>`<div class="exam"><div class="exam-top"><strong>${esc(exam.name)}</strong><span>${esc(exam.gradeLabel || "")}</span></div>${exam.credits ? `<span>${esc(exam.credits)} ECTS/credits</span>` : ""}${(exam.repos || []).map(r=>`<div><a class="text-link" href="${esc(r.url)}" target="_blank" rel="noreferrer">${esc(r.label)} <span class="arrow">↗</span></a></div>`).join("")}</div>`).join("")}</div></div>` : ""}
        </div></div></div>
      </section></div>`;
    document.body.classList.add("modal-open");
    const backdrop = modalRoot.querySelector(".modal-backdrop");
    const close = modalRoot.querySelector(".modal-close");
    const dismiss = () => { modalRoot.innerHTML = ""; document.body.classList.remove("modal-open"); };
    close?.focus();
    close?.addEventListener("click", dismiss);
    backdrop?.addEventListener("click", e => { if (e.target === backdrop) dismiss(); });
    const onKey = e => { if (e.key === "Escape" && modalRoot.innerHTML) { dismiss(); document.removeEventListener("keydown", onKey); } };
    document.addEventListener("keydown", onKey);
    modalRoot.querySelectorAll("[data-gallery-src]").forEach(thumb => thumb.addEventListener("click", () => {
      const image = modalRoot.querySelector(".gallery-main");
      if (image) { image.style.display = ""; image.src = thumb.dataset.gallerySrc; }
      modalRoot.querySelectorAll(".thumb").forEach(t => t.classList.toggle("active", t === thumb));
    }));
  }

  function renderPublications(publications) {
    const sorted = [...publications].sort((a,b)=>(b.year||0)-(a.year||0));
    main.innerHTML = `
      ${heroBlock("Publications", "Research made <span class='accent'>visible and interpretable.</span>", "Work at the intersection of machine learning, explainability and seismology, with links to papers, abstracts and presentation material.")}
      <section class="section compact"><div class="container"><div class="quick-facts" style="margin-bottom:32px"><div class="fact"><strong>${sorted.length}</strong><span>Research outputs listed</span></div><div class="fact"><strong>${new Set(sorted.map(p=>p.year)).size}</strong><span>Publication years</span></div><div class="fact"><strong>XAI</strong><span>Core interpretability focus</span></div><div class="fact"><strong>CNN</strong><span>Primary deep-learning family</span></div></div><div class="pub-list">${sorted.map(p => publicationCard(p)).join("")}</div></div></section>`;
  }

  async function renderProjects(config, projects) {
    const active = (projects.projects || []).filter(p => p.enabled !== false);
    main.innerHTML = `
      ${heroBlock("Projects", "From research prototypes to <span class='accent'>working products.</span>", "A curated set of current and past projects across explainable AI, scientific machine learning, data products and numerical methods.")}
      <section class="section compact"><div class="container"><div class="filter-bar"><button class="filter-btn active" data-project-filter="all">All</button><button class="filter-btn" data-project-filter="current">Currently working on</button><button class="filter-btn" data-project-filter="past">Past projects</button></div><div class="project-grid">${active.map(projectCard).join("")}</div></div></section>
      <section class="section alt"><div class="container"><div class="section-head"><div><div class="eyebrow">GitHub activity</div><h2>Code, experiments & repositories</h2></div><a class="text-link" href="https://github.com/${esc(config.profile?.githubUsername || "FRAMAX444")}" target="_blank" rel="noreferrer">Open GitHub <span class="arrow">↗</span></a></div><div id="github-stats"><div class="empty-state">Loading live GitHub stats…</div></div></div></section>`;
    document.querySelectorAll("[data-project-filter]").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll("[data-project-filter]").forEach(b => b.classList.toggle("active", b === btn));
      const value = btn.dataset.projectFilter;
      document.querySelectorAll(".project-card").forEach(card => { card.hidden = value !== "all" && card.dataset.section !== value; });
    }));
    const statRoot = document.getElementById("github-stats");
    githubStats(config.profile?.githubUsername || "FRAMAX444").then(stats => { if (statRoot) statRoot.innerHTML = statsMarkup(stats); });
  }

  function observeReveals() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(item => item.classList.add("visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
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
      main.innerHTML = `<section class="section"><div class="container"><div class="empty-state"><h2>Portfolio data could not be loaded.</h2><p>Please refresh the page. If the problem persists, open the GitHub repository from the About page.</p></div></div></section>`;
    }
  }

  init();
})();
