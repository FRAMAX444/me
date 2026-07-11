async function fetchGithubRepos() {
  if (!GITHUB_USERNAME) return [];
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`GitHub: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data.filter((repo) => repo && !repo.fork) : [];
  } catch (error) {
    console.warn("GitHub repositories unavailable:", error);
    return [];
  }
}

function projectRepoKey(project) {
  return String(project.repo || project.repository || project.githubRepo || "").toLowerCase().replace(/^.*\//, "");
}

function mergeProjectWithRepo(project, reposByName) {
  const repo = reposByName.get(projectRepoKey(project));
  return {
    ...repo,
    ...project,
    title: project.title || repo?.name || "Untitled project",
    description: project.description || repo?.description || "",
    repoUrl: project.repoUrl || project.githubUrl || repo?.html_url || "",
    language: project.language || repo?.language || "",
    stars: project.stars ?? repo?.stargazers_count ?? 0,
    forks: project.forks ?? repo?.forks_count ?? 0,
    updatedAt: project.updatedAt || repo?.updated_at || ""
  };
}

function initials(title) {
  return String(title || "P").split(/[\s-_]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function renderProjectCard(project, displayOrder) {
  const image = project.image || asArray(project.images)[0] || "";
  const links = asArray(project.links).map((item) => normalizeLink(item)).filter(Boolean);
  if (project.liveUrl) links.unshift({ label: project.liveLabel || "Live demo", url: project.liveUrl, primary: true });
  if (project.repoUrl) links.push({ label: project.repoLabel || "GitHub", url: project.repoUrl, primary: !links.length });
  const tags = [...new Set([...asArray(project.tags), project.language].filter(isText))];
  const meta = [project.year, project.status, project.stars ? `★ ${project.stars}` : "", project.forks ? `${project.forks} forks` : ""].filter(Boolean);
  return `<article class="project-card"><div class="project-card-media ${image ? "" : "no-image"}">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.imageAlt || project.title)}" loading="lazy">` : `<span class="project-monogram">${escapeHtml(initials(project.title))}</span>`}<span class="project-order">${String(displayOrder).padStart(2, "0")}</span></div><div class="project-card-body">${project.eyebrow ? `<span class="project-eyebrow">${escapeHtml(project.eyebrow)}</span>` : ""}<div class="project-card-top"><h3>${escapeHtml(project.title)}</h3>${project.featured ? `<span class="chip grade-chip">Featured</span>` : ""}</div>${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ""}${meta.length ? `<div class="project-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("<span>•</span>")}</div>` : ""}${tags.length ? `<div class="chip-row">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}${links.length ? `<div class="project-actions">${links.map((link, index) => `<a class="button ${(link.primary || index === 0) ? "button-primary" : "button-outline"}" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}</div></article>`;
}

function fallbackProjects(repos) {
  const limit = Number(PROJECTS_DATA.settings?.recentLimit || 8);
  return repos.slice(0, limit).map((repo, index) => ({
    id: repo.name,
    title: repo.name,
    description: repo.description || "GitHub repository",
    section: "recent",
    order: index + 1,
    repoUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    status: "Recent"
  }));
}

async function renderProjects() {
  const settings = PROJECTS_DATA.settings || {};
  $("#projects-title").textContent = settings.title || "Projects";
  $("#projects-subtitle").textContent = settings.subtitle || "A curated selection of software, research and product work.";
  if (settings.githubUsername) GITHUB_USERNAME = settings.githubUsername;

  const repos = await fetchGithubRepos();
  const reposByName = new Map(repos.map((repo) => [String(repo.name).toLowerCase(), repo]));
  let projects = asArray(PROJECTS_DATA.projects)
    .filter((project) => project && project.enabled !== false)
    .map((project) => mergeProjectWithRepo(project, reposByName));

  if (!projects.length) projects = fallbackProjects(repos);
  if (settings.includeUnlistedRecent) {
    const listed = new Set(projects.map(projectRepoKey).filter(Boolean));
    fallbackProjects(repos.filter((repo) => !listed.has(String(repo.name).toLowerCase()))).forEach((project) => projects.push(project));
  }

  const sections = asArray(PROJECTS_DATA.sections).slice().sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
  const knownIds = new Set(sections.map((section) => section.id));
  projects.forEach((project) => {
    const sectionId = project.section || "other";
    if (!knownIds.has(sectionId)) {
      sections.push({ id: sectionId, title: sectionId.replace(/[-_]/g, " "), subtitle: "", order: 500 });
      knownIds.add(sectionId);
    }
  });

  const container = $("#projects-sections");
  const rendered = [];
  sections.forEach((section) => {
    const sectionProjects = projects
      .filter((project) => (project.section || "other") === section.id)
      .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
    if (!sectionProjects.length) return;
    rendered.push(`<section class="project-section"><header class="project-section-head"><h2>${escapeHtml(section.title || section.id)}</h2>${section.subtitle ? `<p>${escapeHtml(section.subtitle)}</p>` : ""}</header><div class="project-grid">${sectionProjects.map((project, index) => renderProjectCard(project, index + 1)).join("")}</div></section>`);
  });

  if (!rendered.length && projects.length) {
    rendered.push(`<section class="project-section"><div class="project-grid">${projects.sort((a, b) => Number(a.order || 999) - Number(b.order || 999)).map((project, index) => renderProjectCard(project, index + 1)).join("")}</div></section>`);
  }
  container.innerHTML = rendered.join("") || `<div class="empty-state">Nessun progetto configurato. Aggiungi i progetti in <code>data/projects.json</code>.</div>`;
  $$(".project-card-media img", container).forEach((img) => removeOnImageError(img, (node) => {
    const media = node.closest(".project-card-media");
    const label = node.alt;
    node.remove();
    media.classList.add("no-image");
    media.insertAdjacentHTML("beforeend", `<span class="project-monogram">${escapeHtml(initials(label))}</span>`);
  }));
}

function openLightbox(images, index, title) {
  LIGHTBOX_IMAGES = asArray(images).filter(isText);
  if (!LIGHTBOX_IMAGES.length) return;
  LIGHTBOX_INDEX = Math.max(0, Math.min(Number(index) || 0, LIGHTBOX_IMAGES.length - 1));
  LIGHTBOX_TITLE = title || "Gallery";
  updateLightbox();
  $("#lightbox").classList.add("open");
  $("#lightbox").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function updateLightbox() {
  const image = $("#lightbox-image");
  image.src = LIGHTBOX_IMAGES[LIGHTBOX_INDEX];
  image.alt = `${LIGHTBOX_TITLE} ${LIGHTBOX_INDEX + 1}`;
  $("#lightbox-meta").textContent = `${LIGHTBOX_TITLE} · ${LIGHTBOX_INDEX + 1} / ${LIGHTBOX_IMAGES.length}`;
}

function moveLightbox(step) {
  if (!LIGHTBOX_IMAGES.length) return;
  LIGHTBOX_INDEX = (LIGHTBOX_INDEX + step + LIGHTBOX_IMAGES.length) % LIGHTBOX_IMAGES.length;
  updateLightbox();
}

function closeLightbox() {
  $("#lightbox").classList.remove("open");
  $("#lightbox").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function installGalleryHandlers(scope = document) {
  $$('[data-gallery-images]', scope).forEach((button) => button.addEventListener("click", () => {
    try {
      const images = JSON.parse(button.dataset.galleryImages || "[]");
      openLightbox(images, button.dataset.galleryIndex, button.dataset.galleryTitle);
    } catch (error) {
      console.warn("Invalid gallery data", error);
    }
  }));
}

function initLightbox() {
  $("#lightbox-close").addEventListener("click", closeLightbox);
  $("#lightbox-prev").addEventListener("click", () => moveLightbox(-1));
  $("#lightbox-next").addEventListener("click", () => moveLightbox(1));
  $("#lightbox").addEventListener("click", (event) => { if (event.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", (event) => {
    if (!$("#lightbox").classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
}

async function bootstrap() {
  [SITE_CONFIG, ABOUT_DATA, PUBLICATIONS_DATA, PROJECTS_DATA] = await Promise.all([
    fetchJson("data/site-config.json", {}),
    fetchJson("data/about.json", {}),
    fetchJson("data/publications.json", []),
    fetchJson("data/projects.json", { settings: {}, sections: [], projects: [] })
  ]);
  GITHUB_USERNAME = SITE_CONFIG.profile?.githubUsername || SITE_CONFIG.home?.githubUsername || "";
  renderHome();
  renderAbout();
  renderPublications();
  initLightbox();
  await renderProjects();
  setRoute();
}

window.addEventListener("hashchange", setRoute);
bootstrap().catch((error) => {
  console.error("Bootstrap error:", error);
  document.body.innerHTML = `<main class="container page-shell"><div class="empty-state">Errore nel caricamento del portfolio. Controlla i file JSON e la console del browser.</div></main>`;
});
