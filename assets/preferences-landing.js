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
      .about-timeline-card:not(.about-language-card),
      .about-timeline-card:not(.about-language-card) .about-timeline-content,
      .about-timeline-card:not(.about-language-card) .timeline-org-head,
      .about-timeline-card:not(.about-language-card) .timeline-items,
      .about-timeline-card:not(.about-language-card) .feed-card,
      .about-timeline-card:not(.about-language-card) .feed-card > .feed-head {
        transition: background-color .18s ease, box-shadow .18s ease;
      }

      .about-timeline-card:not(.about-language-card).has-open-item,
      .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media,
      .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-content,
      .about-timeline-card:not(.about-language-card).has-open-item .timeline-org-head,
      .about-timeline-card:not(.about-language-card).has-open-item .timeline-items,
      .about-timeline-card:not(.about-language-card).has-open-item .feed-card,
      .about-timeline-card:not(.about-language-card).has-open-item .feed-card > .feed-head {
        background: #eef1f4 !important;
        background-image: none !important;
      }

      .about-timeline-card:not(.about-language-card).has-open-item .feed-card.open > .feed-head {
        box-shadow: inset 0 -1px 0 #d7dee6;
      }

      .about-timeline-card:not(.about-language-card).has-open-item .feed-card.open > .feed-body {
        background: #ffffff !important;
        border-color: #d7dee6 !important;
      }

      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-content,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .timeline-org-head,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .timeline-items,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .feed-card,
      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .feed-card > .feed-head {
        background: #293440 !important;
        background-image: none !important;
      }

      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .feed-card.open > .feed-head {
        box-shadow: inset 0 -1px 0 #3b4856;
      }

      :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .feed-card.open > .feed-body {
        background: #141b23 !important;
        border-color: #3b4856 !important;
      }

      @media (max-width: 760px) {
        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card) .about-timeline-media .timeline-logo {
          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          clip-path: inset(1px);
        }
      }

      @media (min-width: 761px) {
        .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media {
          box-sizing: border-box;
          overflow: hidden !important;
          border: 1px solid #dbe3ec;
          border-radius: 22px;
          background-clip: padding-box;
          box-shadow: 0 12px 24px rgba(15, 23, 42, .08);
        }

        .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media .timeline-logo {
          display: block;
          width: 100% !important;
          height: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          max-width: none !important;
          max-height: none !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 21px !important;
          object-fit: contain !important;
          box-shadow: none !important;
          clip-path: inset(0 round 21px);
        }

        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media {
          border-color: #354353;
          box-shadow: 0 12px 24px rgba(0, 0, 0, .22);
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