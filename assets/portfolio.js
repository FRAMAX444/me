(() => {
  "use strict";

  const page = document.body.dataset.page || "home";
  const main = document.getElementById("main");
  const headerRoot = document.getElementById("site-header");
  const footerRoot = document.getElementById("site-footer");
  const modalRoot = document.getElementById("modal-root");
  const cache = new Map();
  const EXT_ARROW = "↗︎";

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

  function renderHeader(content) {
    const nav = content.navigation || [];
    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="container nav-shell">
          <nav class="nav-tabs" aria-label="Primary navigation">
            ${nav.map(item => `<a class="nav-link ${item.id === page ? "active" : ""}" href="${esc(item.href)}" ${item.id === page ? 'aria-current="page"' : ""}>${esc(item.label)}</a>`).join("")}
          </nav>
        </div>
      </header>`;
  }

  function renderFooter(config) {
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-row">${esc(config.profile?.name || "Francesco Marrocco")}</div>
      </footer>`;
  }

  function pageIntro(title, subtitle = "") {
    return `<section class="page-intro"><div class="narrow"><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div></section>`;
  }

  function sectionHeader(section = {}) {
    return `<div class="section-head"><h2>${esc(section.title || "")}</h2>${section.subtitle ? `<p>${esc(section.subtitle)}</p>` : ""}</div>`;
  }

  function socialGrid(config, order = []) {
    const socials = config.socials || {};
    const keys = order.length ? order : Object.keys(socials);
    return `<div class="social-grid">${keys.filter(key => socials[key]).map(key => {
      const social = socials[key];
      const external = !String(social.href || "").startsWith("mailto:");
      return `<a class="social-row" href="${esc(social.href)}" ${external ? 'target="_blank" rel="noreferrer"' : ""}>
        <span class="social-icon"><img src="${esc(social.icon || "")}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></span>
        <span class="social-copy"><strong>${esc(social.label)}</strong><span>${esc(social.handle || "")}</span></span>
        <span class="social-arrow external-arrow" aria-hidden="true">${EXT_ARROW}</span>
      </a>`;
    }).join("")}</div>`;
  }

  function projectRow(project) {
    const media = project.media?.[0];
    const repo = project.repoUrl?.replace(/\/PINNs\.png$/, "/PINNs");
    return `
      <article class="project-row" data-section="${esc(project.section || "")}">
        ${media ? `<a class="project-media" href="${esc(media.src)}" target="_blank" rel="noreferrer" aria-label="Open image for ${esc(project.title)}"><img src="${esc(media.src)}" alt="${esc(media.alt || project.title)}" loading="lazy" onerror="this.closest('.project-media').style.display='none'"></a>` : "<div></div>"}
        <div class="project-copy">
          <div class="project-meta">${esc(project.eyebrow || "")}${project.year ? ` · ${esc(project.year)}` : ""}</div>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description || "")}</p>
          ${(project.tags || []).length ? `<div class="tag-line">${project.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>` : ""}
          <div class="row-links">
            ${repo ? `<a class="text-link" href="${esc(repo)}" target="_blank" rel="noreferrer">${esc(project.repoLabel || "Repository")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>` : ""}
            ${project.liveUrl ? `<a class="text-link" href="${esc(project.liveUrl)}" target="_blank" rel="noreferrer">${esc(project.liveLabel || "Live")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>` : ""}
            ${(project.links || []).map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>`).join("")}
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
            ${pub.href ? `<a class="text-link" href="${esc(pub.href)}" target="_blank" rel="noreferrer">${esc(labels.publicationLabel || "Publication")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>` : ""}
            ${(pub.links || []).map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>`).join("")}
          </div>
          ${pub.notes ? `<details class="pub-details"><summary>${esc(labels.abstractLabel || "Abstract")}</summary><p>${esc(pub.notes)}</p></details>` : ""}
        </div>
      </article>`;
  }

  function renderHome(content, config, projects, publications) {
    const home = content.home || {};
    const profile = config.profile || {};
    const enabledProjects = (projects.projects || []).filter(project => project.enabled !== false);
    const selectedIds = home.selectedProjects?.ids || [];
    const selectedProjects = selectedIds.length
      ? selectedIds.map(id => enabledProjects.find(project => project.id === id)).filter(Boolean)
      : enabledProjects.slice(0, 3);
    const recent = [...publications]
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, home.recentPublications?.limit || 3);

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <h1>${esc(profile.name || "")}</h1>
            <p class="hero-role">${esc(profile.role || "")}</p>
          </div>
          <div class="hero-photo-wrap">
            <img class="hero-photo" src="${esc(config.images?.profilePhoto || "")}" alt="${esc(profile.name || "")}" onerror="this.style.display='none'">
          </div>
        </div>
      </section>

      <section class="content-section home-section" id="socials">
        <div class="container">
          ${sectionHeader(home.socials)}
          ${socialGrid(config, home.socialOrder || [])}
        </div>
      </section>

      <section class="content-section home-section" id="about">
        <div class="container">
          ${sectionHeader(home.about)}
          <div class="about-copy">${(home.about?.body || []).map(paragraph => `<p>${esc(paragraph)}</p>`).join("")}</div>
        </div>
      </section>

      <section class="content-section home-section">
        <div class="container">
          ${sectionHeader(home.selectedProjects)}
          <div class="project-list">${selectedProjects.map(projectRow).join("")}</div>
          <div class="row-links section-more"><a class="text-link" href="projects.html">${esc(content.navigation?.find(item => item.id === "projects")?.label || "Projects")} →</a></div>
        </div>
      </section>

      <section class="content-section home-section">
        <div class="container">
          ${sectionHeader(home.recentPublications)}
          <div class="pub-list">${recent.map(pub => publicationRow(pub, content.publications || {})).join("")}</div>
          <div class="row-links section-more"><a class="text-link" href="publications.html">${esc(content.navigation?.find(item => item.id === "publications")?.label || "Publications")} →</a></div>
        </div>
      </section>`;
  }

  function splitNotes(text = "") {
    const normalized = String(text).replace(/\r/g, "").trim();
    if (!normalized) return [];
    const bulletParts = normalized.split(/\n\s*\n|\n(?=•)/).map(part => part.trim()).filter(Boolean);
    if (bulletParts.length > 1 || bulletParts.some(part => part.startsWith("•"))) {
      return bulletParts.map(part => part.replace(/^•\s*/, "").trim()).filter(Boolean);
    }
    return [normalized];
  }

  function firstPreview(item) {
    if (item.summary) return item.summary;
    return splitNotes(item.notes)[0] || "";
  }

  function institutionOf(item) {
    return item.organization || item.institution || item.type || "";
  }

  function canonicalInstitution(item) {
    return institutionOf(item).trim().toLowerCase();
  }

  function groupByInstitution(items = []) {
    const groups = [];
    items.forEach((item, index) => {
      const key = canonicalInstitution(item);
      const current = groups[groups.length - 1];
      if (current && current.key === key) {
        current.items.push({ item, index });
      } else {
        groups.push({ key, items: [{ item, index }] });
      }
    });
    return groups;
  }

  function cvEntry(item, sectionKey, index, firstInInstitution, labels) {
    const org = institutionOf(item);
    const preview = firstPreview(item);
    const marker = firstInInstitution
      ? (item.organizationImage
          ? `<img class="cv-logo" src="${esc(item.organizationImage)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;cv-logo-placeholder&quot;>${esc((org || "?").slice(0, 1))}</span>'">`
          : `<span class="cv-logo-placeholder">${esc((org || "?").slice(0, 1))}</span>`)
      : `<span class="cv-dot" aria-hidden="true"></span>`;

    return `
      <button class="cv-entry-trigger ${firstInInstitution ? "institution-first" : "institution-continuation"}" type="button"
        data-cv-section="${esc(sectionKey)}" data-cv-index="${index}" aria-label="${esc(labels.details || "View details")}: ${esc(item.title || org)}">
        <span class="cv-marker">${marker}</span>
        <span class="cv-entry-copy">
          <span class="cv-meta">${esc(item.period || "")}</span>
          <span class="cv-title">${esc(item.title || org)}</span>
          <span class="cv-org">${esc(org)}</span>
          ${item.location ? `<span class="cv-location">${esc(item.location)}</span>` : ""}
          ${item.finalGrade ? `<span class="cv-grade">${esc(item.finalGrade)}</span>` : ""}
          ${preview ? `<span class="cv-preview">${esc(preview)}</span>` : ""}
        </span>
        <span class="cv-entry-action external-arrow" aria-hidden="true">${EXT_ARROW}</span>
      </button>`;
  }

  function cvInstitutionGroups(items, sectionKey, labels) {
    return groupByInstitution(items).map(group => {
      const connected = group.items.length > 1;
      return `<div class="cv-institution-group ${connected ? "connected" : "single"}">
        ${group.items.map(({ item, index }, position) => cvEntry(item, sectionKey, index, position === 0, labels)).join("")}
      </div>`;
    }).join("");
  }

  function linkBlock(item, labels) {
    const links = [...(item.links || []), ...(item.thesis || [])];
    if (!links.length) return "";
    return `<section class="modal-block"><h3>${esc(labels.links || "Links")}</h3><div class="row-links">${links.map(link => `<a class="text-link" href="${esc(link.href || link.url)}" target="_blank" rel="noreferrer">${esc(link.label || "Open")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>`).join("")}</div></section>`;
  }

  function honoursBlock(item, labels) {
    const honours = item.honors || [];
    if (!honours.length) return "";
    return `<section class="modal-block"><h3>${esc(labels.honours || "Honours")}</h3><div class="honour-list">${honours.map(honour => `
      <article class="honour-row">
        <div><strong>${esc(honour.title || "")}</strong>${honour.description ? `<p>${esc(honour.description)}</p>` : ""}</div>
        <span>${esc(honour.date || "")}</span>
      </article>`).join("")}</div></section>`;
  }

  function courseworkBlock(item, labels) {
    const exams = item.exams || [];
    if (!exams.length) return "";
    return `<section class="modal-block"><details class="coursework" open><summary>${esc(labels.coursework || "Coursework")} (${exams.length})</summary><div class="course-list">${exams.map(exam => `
      <div class="course-row">
        <div class="course-name">${esc(exam.name || "")}</div>
        <div class="course-grade">${esc(exam.gradeLabel || "")}</div>
        <div class="course-credits">${exam.credits ? `${esc(exam.credits)} ${esc(labels.credits || "credits")}` : ""}</div>
        ${(exam.repos || []).length ? `<div class="course-repos">${exam.repos.map(repo => `<a class="text-link" href="${esc(repo.url)}" target="_blank" rel="noreferrer">${esc(repo.label)} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a>`).join("")}</div>` : ""}
      </div>`).join("")}</div></details></section>`;
  }

  function galleryBlock(item, labels) {
    const images = (item.images || []).filter(Boolean);
    if (!images.length) return "";
    return `<section class="modal-block"><h3>${esc(labels.gallery || "Images")}</h3><div class="cv-gallery">${images.map((src, index) => `<a href="${esc(src)}" target="_blank" rel="noreferrer"><img src="${esc(src)}" alt="${esc(item.title || institutionOf(item))} ${index + 1}" loading="lazy" onerror="this.parentElement.style.display='none'"></a>`).join("")}</div></section>`;
  }

  function openCvModal(item, labels, trigger) {
    if (!modalRoot || !item) return;
    const org = institutionOf(item);
    const notes = splitNotes(item.notes);
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title">
          <header class="modal-header">
            <div>
              <div class="modal-meta">${esc(item.period || "")}${item.location ? ` · ${esc(item.location)}` : ""}</div>
              <h2 id="cv-modal-title">${esc(item.title || org)}</h2>
              <p>${esc(org)}</p>
              ${item.finalGrade ? `<span class="modal-grade">${esc(item.finalGrade)}</span>` : ""}
            </div>
            <button class="modal-close" type="button" aria-label="${esc(labels.close || "Close")}">×</button>
          </header>
          <div class="modal-content">
            ${item.summary ? `<p class="modal-lede">${esc(item.summary)}</p>` : ""}
            ${notes.length ? `<section class="modal-block"><ul class="modal-notes">${notes.map(note => `<li>${esc(note)}</li>`).join("")}</ul></section>` : ""}
            ${honoursBlock(item, labels)}
            ${linkBlock(item, labels)}
            ${courseworkBlock(item, labels)}
            ${galleryBlock(item, labels)}
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
      trigger?.focus();
    };
    const onKey = (event) => {
      if (event.key === "Escape") dismiss();
    };

    close?.addEventListener("click", dismiss);
    backdrop?.addEventListener("click", event => {
      if (event.target === backdrop) dismiss();
    });
    document.addEventListener("keydown", onKey);
    close?.focus();
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
      ${pageIntro(cv.title || "CV")}
      <section class="cv-page"><div class="narrow">
        <div class="filter-bar" aria-label="CV filters">
          ${(cv.filters || []).map(filter => `<button class="filter-btn ${filter.id === "all" ? "active" : ""}" type="button" data-cv-filter="${esc(filter.id)}">${esc(filter.label)}</button>`).join("")}
        </div>
        ${["experience", "education", "other"].map(key => `
          <section class="cv-section" data-cv-section="${key}">
            <div class="cv-section-head"><h2>${esc(sections[key]?.title || key)}</h2></div>
            <div class="cv-list">${cvInstitutionGroups(groups[key], key, labels)}</div>
          </section>`).join("")}
        <section class="cv-section" data-cv-section="languages">
          <div class="cv-section-head"><h2>${esc(sections.languages?.title || "Languages")}</h2></div>
          ${renderLanguages(groups.languages)}
        </section>
      </div></section>`;

    document.querySelectorAll("[data-cv-filter]").forEach(button => button.addEventListener("click", () => {
      const value = button.dataset.cvFilter;
      document.querySelectorAll("[data-cv-filter]").forEach(candidate => candidate.classList.toggle("active", candidate === button));
      document.querySelectorAll("[data-cv-section]").forEach(section => {
        section.hidden = value !== "all" && section.dataset.cvSection !== value;
      });
    }));

    document.querySelectorAll(".cv-entry-trigger").forEach(trigger => trigger.addEventListener("click", () => {
      const sectionKey = trigger.dataset.cvSection;
      const index = Number(trigger.dataset.cvIndex);
      openCvModal(groups[sectionKey]?.[index], labels, trigger);
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
    const enabled = (projects.projects || []).filter(project => project.enabled !== false)
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
          ${sections.map(section => `<button class="filter-btn" type="button" data-project-filter="${esc(section.id)}">${esc(section.title)}</button>`).join("")}
        </div>
        <div class="project-list">${enabled.map(projectRow).join("")}</div>
      </div></section>`;

    document.querySelectorAll("[data-project-filter]").forEach(button => button.addEventListener("click", () => {
      const value = button.dataset.projectFilter;
      document.querySelectorAll("[data-project-filter]").forEach(candidate => candidate.classList.toggle("active", candidate === button));
      document.querySelectorAll(".project-row").forEach(row => {
        row.hidden = value !== "all" && row.dataset.section !== value;
      });
    }));
  }

  function tagMap(blog) {
    return new Map((blog.tags || []).map(tag => [tag.id, tag.label]));
  }

  function tagLabels(post, blog) {
    const labels = tagMap(blog);
    return (post.tags || []).map(tag => labels.get(tag) || tag);
  }

  function blogPreview(post, blog) {
    return `<article class="blog-row" data-blog-tags="${esc((post.tags || []).join(","))}">
      <a class="blog-row-link" href="blog.html?post=${encodeURIComponent(post.id)}">
        <div class="blog-date">${esc(post.dateLabel || post.date || "")}</div>
        <div class="blog-row-copy">
          <div class="blog-tags">${tagLabels(post, blog).map(label => `<span>${esc(label)}</span>`).join("")}</div>
          <h2>${esc(post.title)}</h2>
          <p>${esc(post.excerpt || "")}</p>
          <span class="blog-read">${esc(blog.settings?.readLabel || "Read article")} →</span>
        </div>
      </a>
    </article>`;
  }

  function renderPostBlock(block) {
    if (typeof block === "string") return `<p>${esc(block)}</p>`;
    if (!block || !block.type) return "";
    if (block.type === "heading") return `<h2>${esc(block.text || "")}</h2>`;
    if (block.type === "quote") return `<blockquote>${esc(block.text || "")}</blockquote>`;
    if (block.type === "link") return `<p class="post-link"><span>${esc(block.text || "")}</span><a class="text-link" href="${esc(block.href || "")}" target="_blank" rel="noreferrer">${esc(block.label || "Open")} <span class="external-arrow" aria-hidden="true">${EXT_ARROW}</span></a></p>`;
    if (block.type === "image") return `<figure><img src="${esc(block.src || "")}" alt="${esc(block.alt || "")}" loading="lazy">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ""}</figure>`;
    return `<p>${esc(block.text || "")}</p>`;
  }

  function renderBlogPost(blog, post) {
    main.innerHTML = `
      <article class="blog-post">
        <div class="narrow">
          <a class="blog-back text-link" href="blog.html">← ${esc(blog.settings?.backLabel || "Back to all posts")}</a>
          <div class="blog-post-meta">${esc(post.dateLabel || post.date || "")}</div>
          <div class="blog-tags">${tagLabels(post, blog).map(label => `<span>${esc(label)}</span>`).join("")}</div>
          <h1>${esc(post.title)}</h1>
          ${post.excerpt ? `<p class="blog-post-lede">${esc(post.excerpt)}</p>` : ""}
          <div class="blog-body">${(post.body || []).map(renderPostBlock).join("")}</div>
        </div>
      </article>`;
  }

  function renderBlog(content, blog) {
    const posts = (blog.posts || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const postId = new URLSearchParams(window.location.search).get("post");
    const selectedPost = posts.find(post => post.id === postId);
    if (selectedPost) {
      renderBlogPost(blog, selectedPost);
      return;
    }

    const labels = tagMap(blog);
    const tagIds = (blog.tags || []).map(tag => tag.id);

    main.innerHTML = `
      ${pageIntro(blog.settings?.title || "Blog", blog.settings?.subtitle || "")}
      <section class="blog-index"><div class="container blog-layout">
        <aside class="blog-filter" aria-label="${esc(blog.settings?.tagsLabel || "Tags")}">
          <div class="blog-filter-title">${esc(blog.settings?.tagsLabel || "Tags")}</div>
          <button class="blog-filter-btn active" type="button" data-blog-filter="all">${esc(blog.settings?.allLabel || "All")}</button>
          ${tagIds.map(id => `<button class="blog-filter-btn" type="button" data-blog-filter="${esc(id)}">${esc(labels.get(id) || id)}</button>`).join("")}
        </aside>
        <div class="blog-list">${posts.map(post => blogPreview(post, blog)).join("")}</div>
      </div></section>`;

    document.querySelectorAll("[data-blog-filter]").forEach(button => button.addEventListener("click", () => {
      const value = button.dataset.blogFilter;
      document.querySelectorAll("[data-blog-filter]").forEach(candidate => candidate.classList.toggle("active", candidate === button));
      document.querySelectorAll(".blog-row").forEach(row => {
        const tags = (row.dataset.blogTags || "").split(",").filter(Boolean);
        row.hidden = value !== "all" && !tags.includes(value);
      });
    }));
  }

  async function init() {
    try {
      const [content, config] = await Promise.all([
        getJSON("data/content.json"),
        getJSON("data/site-config.json")
      ]);

      renderHeader(content);
      renderFooter(config);

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
      } else if (page === "blog") {
        renderBlog(content, await getJSON("data/blog.json"));
      }
    } catch (error) {
      console.error(error);
      if (main) main.innerHTML = `<div class="narrow empty-state">Portfolio data could not be loaded.</div>`;
    }
  }

  init();
})();
