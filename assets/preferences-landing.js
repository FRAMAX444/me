(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const ROUTES = ["home", "about", "works", "publications"];

  function installFixStyles(doc) {
    if (!doc?.head) return;

    if (!doc.getElementById("portfolio-preferences-fixes")) {
      const link = doc.createElement("link");
      link.id = "portfolio-preferences-fixes";
      link.rel = "stylesheet";
      link.href = "assets/preferences-fixes.css";
      doc.head.appendChild(link);
    }

    if (doc.getElementById("about-mobile-dark-media-fix")) return;

    const style = doc.createElement("style");
    style.id = "about-mobile-dark-media-fix";
    style.textContent = `
      @media (max-width: 760px) {
        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }

        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media .timeline-logo {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }
      }
    `;
    doc.head.appendChild(style);
  }

  function reorderProjectsAndPublications(doc) {
    const nav = doc?.querySelector(".nav");
    const projectsLink = nav?.querySelector('[data-route="works"]');
    const publicationsLink = nav?.querySelector('[data-route="publications"]');

    if (nav && projectsLink && publicationsLink) {
      nav.insertBefore(projectsLink, publicationsLink);
    }

    const main = doc?.querySelector("main");
    const projectsPage = doc?.getElementById("page-works");
    const publicationsPage = doc?.getElementById("page-publications");

    if (main && projectsPage && publicationsPage) {
      main.insertBefore(projectsPage, publicationsPage);
    }
  }

  function ensureControlsWrap(doc, route) {
    const page = doc?.getElementById(`page-${route}`);
    if (!page) return null;

    const wrapId = `portfolio-controls-wrap-${route}`;
    let wrapper = doc.getElementById(wrapId);
    if (wrapper) return wrapper;

    wrapper = doc.createElement("div");
    wrapper.id = wrapId;
    wrapper.className = "portfolio-controls-wrap";
    wrapper.dataset.noTranslate = "true";

    if (route === "home") {
      page.querySelector(".home-hero-content")?.prepend(wrapper);
      return wrapper.isConnected ? wrapper : null;
    }

    const column = page.querySelector(".container > .single-col");
    if (!column) return null;

    const introCard = column.querySelector(":scope > .card");
    if (introCard) introCard.after(wrapper);
    else column.prepend(wrapper);

    return wrapper;
  }

  function installControlsWraps(doc) {
    ROUTES.forEach((route) => ensureControlsWrap(doc, route));
  }

  function syncControlsToActivePage(doc) {
    const controls = doc?.getElementById("portfolio-controls");
    if (!controls) return;

    const activePage = doc.querySelector(".page.active") || doc.getElementById("page-home");
    const route = activePage?.id?.replace(/^page-/, "");
    const wrapper = route ? ensureControlsWrap(doc, route) : null;
    wrapper?.appendChild(controls);
  }

  function observeRouteChanges(doc) {
    const win = doc?.defaultView;
    if (!win) return;

    if (win.__portfolioControlsRouteHandler) {
      win.removeEventListener("hashchange", win.__portfolioControlsRouteHandler);
    }

    const handler = () => win.requestAnimationFrame(() => syncControlsToActivePage(doc));
    win.__portfolioControlsRouteHandler = handler;
    win.addEventListener("hashchange", handler);
  }

  preferences.install = async (frame) => {
    await installPreferences(frame);

    const doc = frame?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;

    installFixStyles(doc);
    reorderProjectsAndPublications(doc);
    installControlsWraps(doc);
    syncControlsToActivePage(doc);
    observeRouteChanges(doc);
  };
})();
