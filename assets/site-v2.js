(() => {
  const SUPPORTED = ["en", "it", "es", "fr", "de"];
  const UI = {
    en: { kicker: "Mathematics · AI · Research", about: "About", experience: "Experience", education: "Education", research: "Research", projects: "Projects", more: "Beyond", contact: "Contact", profile: "Profile", selectedExperience: "Selected experience", educationTraining: "Education & training", publications: "Research & publications", selectedWork: "Selected work", current: "Currently working on", past: "Past projects", other: "Other experiences", languages: "Languages", connect: "Connect", contactCopy: "For research, collaborations, projects, or professional opportunities, the fastest way to reach me is by email or LinkedIn.", exams: "Coursework & exams", honors: "Honours & distinctions", links: "Links", abstract: "Abstract", closeAbstract: "Close abstract", themeDark: "Dark", themeLight: "Light", loading: "Loading portfolio…", errorTitle: "Unable to load the portfolio", errorBody: "Some portfolio data could not be loaded. Please refresh the page or try again shortly.", live: "Live website", repository: "Repository", thesis: "Thesis & materials", credits: "credits", built: "Designed and built as a lightweight, data-driven portfolio." },
    it: { kicker: "Matematica · IA · Ricerca", about: "Profilo", experience: "Esperienza", education: "Formazione", research: "Ricerca", projects: "Progetti", more: "Altro", contact: "Contatti", profile: "Profilo", selectedExperience: "Esperienze selezionate", educationTraining: "Formazione", publications: "Ricerca e pubblicazioni", selectedWork: "Progetti selezionati", current: "In corso", past: "Progetti passati", other: "Altre esperienze", languages: "Lingue", connect: "Contatti", contactCopy: "Per ricerca, collaborazioni, progetti o opportunità professionali, il modo più rapido per contattarmi è via email o LinkedIn.", exams: "Corsi ed esami", honors: "Riconoscimenti", links: "Link", abstract: "Abstract", closeAbstract: "Chiudi abstract", themeDark: "Scuro", themeLight: "Chiaro", loading: "Caricamento portfolio…", errorTitle: "Impossibile caricare il portfolio", errorBody: "Alcuni dati del portfolio non sono stati caricati. Aggiorna la pagina o riprova tra poco.", live: "Sito web", repository: "Repository", thesis: "Tesi e materiali", credits: "CFU", built: "Portfolio leggero e data-driven, progettato e sviluppato su misura." },
    es: { kicker: "Matemáticas · IA · Investigación", about: "Perfil", experience: "Experiencia", education: "Formación", research: "Investigación", projects: "Proyectos", more: "Más", contact: "Contacto", profile: "Perfil", selectedExperience: "Experiencia seleccionada", educationTraining: "Formación", publications: "Investigación y publicaciones", selectedWork: "Proyectos seleccionados", current: "En curso", past: "Proyectos anteriores", other: "Otras experiencias", languages: "Idiomas", connect: "Contacto", contactCopy: "Para investigación, colaboraciones, proyectos u oportunidades profesionales, la forma más rápida de contactarme es por correo electrónico o LinkedIn.", exams: "Cursos y exámenes", honors: "Reconocimientos", links: "Enlaces", abstract: "Resumen", closeAbstract: "Cerrar resumen", themeDark: "Oscuro", themeLight: "Claro", loading: "Cargando portfolio…", errorTitle: "No se pudo cargar el portfolio", errorBody: "No se pudieron cargar algunos datos. Actualiza la página o inténtalo de nuevo en breve.", live: "Sitio web", repository: "Repositorio", thesis: "Tesis y materiales", credits: "créditos", built: "Portfolio ligero y basado en datos, diseñado y desarrollado a medida." },
    fr: { kicker: "Mathématiques · IA · Recherche", about: "Profil", experience: "Expérience", education: "Formation", research: "Recherche", projects: "Projets", more: "Plus", contact: "Contact", profile: "Profil", selectedExperience: "Expériences sélectionnées", educationTraining: "Formation", publications: "Recherche et publications", selectedWork: "Projets sélectionnés", current: "En cours", past: "Projets précédents", other: "Autres expériences", languages: "Langues", connect: "Contact", contactCopy: "Pour la recherche, les collaborations, les projets ou les opportunités professionnelles, le moyen le plus rapide de me joindre est par e-mail ou LinkedIn.", exams: "Cours et examens", honors: "Distinctions", links: "Liens", abstract: "Résumé", closeAbstract: "Fermer le résumé", themeDark: "Sombre", themeLight: "Clair", loading: "Chargement du portfolio…", errorTitle: "Impossible de charger le portfolio", errorBody: "Certaines données n’ont pas pu être chargées. Actualisez la page ou réessayez dans quelques instants.", live: "Site web", repository: "Dépôt", thesis: "Mémoire et ressources", credits: "crédits", built: "Portfolio léger et piloté par les données, conçu et développé sur mesure." },
    de: { kicker: "Mathematik · KI · Forschung", about: "Profil", experience: "Erfahrung", education: "Ausbildung", research: "Forschung", projects: "Projekte", more: "Mehr", contact: "Kontakt", profile: "Profil", selectedExperience: "Ausgewählte Erfahrung", educationTraining: "Ausbildung", publications: "Forschung und Publikationen", selectedWork: "Ausgewählte Projekte", current: "Aktuell", past: "Frühere Projekte", other: "Weitere Erfahrungen", languages: "Sprachen", connect: "Kontakt", contactCopy: "Für Forschung, Kooperationen, Projekte oder berufliche Möglichkeiten erreichen Sie mich am schnellsten per E-Mail oder LinkedIn.", exams: "Kurse und Prüfungen", honors: "Auszeichnungen", links: "Links", abstract: "Abstract", closeAbstract: "Abstract schließen", themeDark: "Dunkel", themeLight: "Hell", loading: "Portfolio wird geladen…", errorTitle: "Portfolio konnte nicht geladen werden", errorBody: "Einige Portfolio-Daten konnten nicht geladen werden. Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.", live: "Website", repository: "Repository", thesis: "Abschlussarbeit und Materialien", credits: "Credits", built: "Leichtes, datengetriebenes Portfolio, individuell gestaltet und entwickelt." }
  };

  const state = {
    language: getInitialLanguage(),
    theme: getInitialTheme(),
    strings: {},
    data: null
  };

  function getInitialLanguage() {
    const stored = localStorage.getItem("portfolio-language");
    if (SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.languages || [navigator.language || "en"])
      .map(v => String(v).toLowerCase().split("-")[0])
      .find(v => SUPPORTED.includes(v));
    return browser || "en";
  }

  function getInitialTheme() {
    const stored = localStorage.getItem("portfolio-theme");
    if (["light", "dark"].includes(stored)) return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function u(key) { return UI[state.language]?.[key] || UI.en[key] || key; }
  function t(value) {
    if (value === null || value === undefined) return "";
    const raw = String(value);
    return state.strings[raw] || raw;
  }
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function href(value) { return esc(value || "#"); }

  async function json(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  }

  async function loadTranslations(language) {
    const files = language === "en"
      ? ["data/i18n/en.json"]
      : [1,2,3,4].map(n => `data/i18n/${language}-${n}.json`);
    const chunks = await Promise.all(files.map(async file => {
      try { return await json(file); } catch { return { strings: {} }; }
    }));
    return Object.assign({}, ...chunks.map(chunk => chunk.strings || {}));
  }

  async function loadData() {
    const [config, about, publications, projects] = await Promise.all([
      json("data/site-config.json"),
      json("data/about.json"),
      json("data/publications.json"),
      json("data/projects.json")
    ]);
    return { config, about, publications, projects };
  }

  function splitNotes(value) {
    const translated = t(value || "").trim();
    if (!translated) return [];
    const bulletParts = translated
      .split(/\n\s*\n|\n(?=\s*•)/g)
      .map(x => x.replace(/^\s*•\s*/, "").trim())
      .filter(Boolean);
    return bulletParts.length ? bulletParts : [translated];
  }

  function renderNotes(value) {
    const parts = splitNotes(value);
    if (!parts.length) return "";
    return `<div class="notes">${parts.map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
  }

  function renderLinks(links = [], extraClass = "") {
    if (!Array.isArray(links) || !links.length) return "";
    return `<div class="inline-links ${extraClass}">${links.map(link => {
      const url = link.url || link.href;
      if (!url) return "";
      return `<a href="${href(url)}" target="_blank" rel="noreferrer">${esc(t(link.label || u("links")))}</a>`;
    }).join("")}</div>`;
  }

  function renderHonors(honors = []) {
    if (!Array.isArray(honors) || !honors.length) return "";
    return `<div class="honors">${honors.map(item => `<div class="honor">
      <strong>${esc(t(item.title))}</strong>
      <span>${esc(t(item.date || ""))}</span>
      ${item.description ? `<p>${esc(t(item.description))}</p>` : ""}
    </div>`).join("")}</div>`;
  }

  function renderExams(exams = []) {
    if (!Array.isArray(exams) || !exams.length) return "";
    return `<details class="disclosure"><summary>${esc(u("exams"))} · ${exams.length}</summary>
      <div class="exam-list">${exams.map(exam => {
        const repos = Array.isArray(exam.repos) ? exam.repos : [];
        const meta = [exam.credits ? `${exam.credits} ${u("credits")}` : "", repos.length ? repos.map(r => t(r.label)).join(" · ") : ""].filter(Boolean).join(" · ");
        return `<div class="exam">
          <span class="exam-name">${esc(t(exam.name))}</span>
          <span class="exam-grade">${esc(t(exam.gradeLabel || ""))}</span>
          ${meta ? `<span class="exam-meta">${esc(meta)}</span>` : ""}
          ${repos.length ? `<span class="exam-meta">${repos.map(r => `<a class="text-link" href="${href(r.url)}" target="_blank" rel="noreferrer">${esc(t(r.label))}</a>`).join(" · ")}</span>` : ""}
        </div>`;
      }).join("")}</div>
    </details>`;
  }

  function timelineItem(item, kind = "experience") {
    const organization = item.organization || item.institution || item.type || "";
    const logo = item.organizationImage;
    const links = Array.isArray(item.links) ? item.links : [];
    const thesis = Array.isArray(item.thesis) ? item.thesis : [];
    return `<article class="timeline-item">
      <div class="timeline-period">${esc(t(item.period || ""))}</div>
      <div class="timeline-body">
        <div class="item-heading">
          <div>
            <h3 class="item-title">${esc(t(item.title || organization))}</h3>
            ${item.title && organization ? `<div class="item-org">${esc(t(organization))}</div>` : ""}
          </div>
          ${logo ? `<img class="item-logo" src="${href(logo)}" alt="" loading="lazy" />` : ""}
        </div>
        ${item.location ? `<p class="item-location">${esc(t(item.location))}</p>` : ""}
        ${item.summary ? `<div class="notes"><p>${esc(t(item.summary))}</p></div>` : ""}
        ${renderNotes(item.notes)}
        ${item.finalGrade ? `<div class="inline-links"><span class="text-link" style="text-decoration:none">${esc(t(item.finalGrade))}</span></div>` : ""}
        ${renderHonors(item.honors)}
        ${renderLinks(thesis, "thesis-links")}
        ${renderLinks(links)}
        ${kind === "education" ? renderExams(item.exams) : ""}
      </div>
    </article>`;
  }

  function renderPublications(publications = []) {
    return `<div class="publications">${publications.map(pub => {
      const authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : (pub.authors || "");
      const extraLinks = Array.isArray(pub.links) ? pub.links : [];
      return `<article class="publication">
        <div class="publication-top">
          <div class="publication-year">${esc(pub.year || "")}</div>
          <div>
            <h3 class="publication-title">${pub.href ? `<a href="${href(pub.href)}" target="_blank" rel="noreferrer">${esc(t(pub.title))}</a>` : esc(t(pub.title))}</h3>
            ${authors ? `<p class="publication-authors">${esc(t(authors))}</p>` : ""}
            ${pub.venue ? `<p class="publication-venue">${esc(t(pub.venue))}</p>` : ""}
            ${renderLinks(extraLinks)}
          </div>
        </div>
        ${pub.notes ? `<details class="disclosure"><summary>${esc(u("abstract"))}</summary><p class="abstract">${esc(t(pub.notes))}</p></details>` : ""}
      </article>`;
    }).join("")}</div>`;
  }

  function projectLinks(project) {
    const links = [];
    if (project.liveUrl) links.push({ label: project.liveLabel || u("live"), url: project.liveUrl });
    if (project.repoUrl) links.push({ label: project.repoLabel || u("repository"), url: project.repoUrl });
    if (Array.isArray(project.links)) links.push(...project.links);
    return renderLinks(links);
  }

  function renderProject(project) {
    const media = Array.isArray(project.media) ? project.media.find(m => m?.src) : null;
    return `<article class="project">
      ${media ? `<div class="project-media"><img src="${href(media.src)}" alt="${esc(t(media.alt || project.title))}" loading="lazy" /></div>` : `<div></div>`}
      <div>
        <p class="project-eyebrow">${esc(t(project.eyebrow || project.status || ""))}${project.year ? ` · ${esc(project.year)}` : ""}</p>
        <h3 class="project-title">${esc(t(project.title))}</h3>
        ${project.description ? `<p class="project-desc">${esc(t(project.description))}</p>` : ""}
        ${Array.isArray(project.tags) && project.tags.length ? `<div class="tags">${project.tags.map(tag => `<span class="tag">${esc(t(tag))}</span>`).join("")}</div>` : ""}
        ${projectLinks(project)}
      </div>
    </article>`;
  }

  function renderSocials(socials = {}) {
    return Object.values(socials).filter(Boolean).map(item => `<a class="social-link" href="${href(item.href)}" ${String(item.href || "").startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}>${esc(t(item.label))}</a>`).join("");
  }

  function renderLanguages(list = []) {
    return `<div class="language-list">${list.map(item => `<div class="language">
      <strong>${esc(t(item.organization || item.title))}</strong>
      <span>${esc([t(item.location || ""), t(item.period || "")].filter(Boolean).join(" · "))}</span>
    </div>`).join("")}</div>`;
  }

  function render() {
    const { config, about, publications, projects } = state.data;
    const profile = config.profile || {};
    const socials = config.socials || {};
    const enabledProjects = (projects.projects || []).filter(p => p.enabled !== false).sort((a,b) => (a.order || 0) - (b.order || 0));
    const currentProjects = enabledProjects.filter(p => p.section === "current");
    const pastProjects = enabledProjects.filter(p => p.section !== "current");
    document.documentElement.lang = state.language;
    document.documentElement.dataset.theme = state.theme;
    document.title = `${profile.name || "Portfolio"} — Portfolio`;

    document.body.innerHTML = `
      <a class="skip-link" href="#about">Skip to content</a>
      <div class="site">
        <aside class="identity" aria-label="Portfolio identity">
          <div class="identity-main">
            <p class="identity-kicker">${esc(u("kicker"))}</p>
            <h1 class="identity-name">${esc(profile.name)}</h1>
            <p class="identity-role">${esc(t(profile.role))}</p>
            <nav class="side-nav" aria-label="Main navigation">
              ${[["about",u("about")],["experience",u("experience")],["education",u("education")],["research",u("research")],["projects",u("projects")],["more",u("more")],["contact",u("contact")]].map(([id,label]) => `<a href="#${id}" data-nav="${id}">${esc(label)}</a>`).join("")}
            </nav>
          </div>
          <div class="identity-footer">
            <div class="socials">${renderSocials(socials)}</div>
            <div class="controls">
              <label class="meta-label" for="language-select" style="position:absolute;clip:rect(0,0,0,0)">Language</label>
              <select id="language-select" class="control" aria-label="Language">
                ${[["en","EN"],["it","IT"],["es","ES"],["fr","FR"],["de","DE"]].map(([value,label]) => `<option value="${value}" ${state.language === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
              <button id="theme-toggle" class="control" type="button">${esc(state.theme === "dark" ? u("themeLight") : u("themeDark"))}</button>
            </div>
          </div>
        </aside>

        <main class="main" id="main-content">
          <section class="section" id="about" data-section>
            <div class="section-head"><p class="section-label">01 · ${esc(u("profile"))}</p><h2 class="section-title">${esc(t(profile.aboutIntro || u("about")))}</h2></div>
            <p class="lede">${esc(t(profile.role))}</p>
            <div class="profile-strip">
              ${config.images?.profilePhoto ? `<img class="profile-photo" src="${href(config.images.profilePhoto)}" alt="${esc(profile.name)}" />` : ""}
              ${profile.homeQuote ? `<blockquote class="profile-quote">${esc(t(profile.homeQuote))}</blockquote>` : ""}
            </div>
          </section>

          <section class="section" id="experience" data-section>
            <div class="section-head"><p class="section-label">02 · ${esc(u("experience"))}</p><h2 class="section-title">${esc(u("selectedExperience"))}</h2></div>
            <div class="timeline">${(about.experience || []).map(item => timelineItem(item, "experience")).join("")}</div>
          </section>

          <section class="section" id="education" data-section>
            <div class="section-head"><p class="section-label">03 · ${esc(u("education"))}</p><h2 class="section-title">${esc(u("educationTraining"))}</h2></div>
            <div class="timeline">${(about.education || []).map(item => timelineItem(item, "education")).join("")}</div>
          </section>

          <section class="section" id="research" data-section>
            <div class="section-head"><p class="section-label">04 · ${esc(u("research"))}</p><h2 class="section-title">${esc(u("publications"))}</h2></div>
            ${renderPublications(publications || [])}
          </section>

          <section class="section" id="projects" data-section>
            <div class="section-head"><p class="section-label">05 · ${esc(u("projects"))}</p><h2 class="section-title">${esc(u("selectedWork"))}</h2></div>
            ${currentProjects.length ? `<div class="subsection"><h3 class="subsection-title">${esc(u("current"))}</h3><p class="subsection-copy">${esc(t((projects.sections || []).find(s => s.id === "current")?.subtitle || ""))}</p><div class="projects">${currentProjects.map(renderProject).join("")}</div></div>` : ""}
            ${pastProjects.length ? `<div class="subsection"><h3 class="subsection-title">${esc(u("past"))}</h3><p class="subsection-copy">${esc(t((projects.sections || []).find(s => s.id === "past")?.subtitle || ""))}</p><div class="projects">${pastProjects.map(renderProject).join("")}</div></div>` : ""}
          </section>

          <section class="section" id="more" data-section>
            <div class="section-head"><p class="section-label">06 · ${esc(u("more"))}</p><h2 class="section-title">${esc(u("other"))}</h2></div>
            <div class="timeline">${(about.otherExperiences || []).map(item => timelineItem(item, "other")).join("")}</div>
            ${(about.languageSkills || []).length ? `<div class="subsection"><h3 class="subsection-title">${esc(u("languages"))}</h3>${renderLanguages(about.languageSkills)}</div>` : ""}
          </section>

          <section class="section" id="contact" data-section>
            <div class="section-head"><p class="section-label">07 · ${esc(u("contact"))}</p><h2 class="section-title">${esc(u("connect"))}</h2></div>
            <div class="contact-grid">
              <p class="contact-copy">${esc(u("contactCopy"))}</p>
              <div class="contact-links">${Object.values(socials).filter(Boolean).map(item => `<a href="${href(item.href)}" ${String(item.href || "").startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}><span>${esc(t(item.label))}</span><span>${esc(t(item.handle || ""))}</span></a>`).join("")}</div>
            </div>
            <p class="site-credit">${esc(u("built"))}</p>
          </section>
        </main>
      </div>`;

    installInteractions();
  }

  function installInteractions() {
    const languageSelect = document.getElementById("language-select");
    languageSelect?.addEventListener("change", async event => {
      const language = event.target.value;
      if (!SUPPORTED.includes(language) || language === state.language) return;
      state.language = language;
      localStorage.setItem("portfolio-language", language);
      state.strings = await loadTranslations(language);
      render();
    });

    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("portfolio-theme", state.theme);
      document.documentElement.dataset.theme = state.theme;
      const button = document.getElementById("theme-toggle");
      if (button) button.textContent = state.theme === "dark" ? u("themeLight") : u("themeDark");
    });

    const navLinks = [...document.querySelectorAll("[data-nav]")];
    const sections = [...document.querySelectorAll("[data-section]")];
    if ("IntersectionObserver" in window && navLinks.length) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach(link => link.classList.toggle("active", link.dataset.nav === visible.target.id));
      }, { rootMargin: "-18% 0px -58% 0px", threshold: [0,.2,.5,1] });
      sections.forEach(section => observer.observe(section));
    }
  }

  async function start() {
    try {
      document.documentElement.lang = state.language;
      document.documentElement.dataset.theme = state.theme;
      const loader = document.getElementById("app");
      if (loader) loader.innerHTML = `<div class="loading">${esc(u("loading"))}</div>`;
      [state.data, state.strings] = await Promise.all([loadData(), loadTranslations(state.language)]);
      render();
    } catch (error) {
      console.error(error);
      document.body.innerHTML = `<div class="error-state"><h1>${esc(u("errorTitle"))}</h1><p>${esc(u("errorBody"))}</p></div>`;
    }
  }

  start();
})();
