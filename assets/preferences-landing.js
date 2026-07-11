(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const ROUTES = ["home", "about", "works", "publications"];
  const FAO_LOGO_PATTERN = /(?:^|\/)FAO_logo\.png(?:[?#]|$)/i;

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
        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card) .about-timeline-media {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }

        :root[data-theme="dark"] .about-timeline-card:not(.about-language-card) .about-timeline-media .timeline-logo {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }
      }
    `;
    doc.head.appendChild(style);
  }

  function createTransparentInstitutionLogo(image) {
    if (!image || image.dataset.transparentInstitutionLogo === "true") return;

    const source = image.dataset.originalInstitutionLogo || image.getAttribute("src") || image.currentSrc || "";
    if (!FAO_LOGO_PATTERN.test(source)) return;

    const process = () => {
      if (!image.naturalWidth || !image.naturalHeight || image.dataset.transparentInstitutionLogo === "true") return;

      const doc = image.ownerDocument;
      const canvas = doc.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      try {
        context.drawImage(image, 0, 0);
        const sourceData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = sourceData.data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = 0; x < canvas.width; x += 1) {
            const offset = (y * canvas.width + x) * 4;
            const red = pixels[offset];
            const green = pixels[offset + 1];
            const blue = pixels[offset + 2];
            const alpha = pixels[offset + 3];

            const coloredLogoPixel = alpha > 24 && blue > red + 28 && green > red + 18 && blue + green > 170;
            if (!coloredLogoPixel) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }

        if (maxX < minX || maxY < minY) return;

        const padding = Math.max(4, Math.round(Math.max(canvas.width, canvas.height) * 0.025));
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width - 1, maxX + padding);
        maxY = Math.min(canvas.height - 1, maxY + padding);

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const output = doc.createElement("canvas");
        output.width = width;
        output.height = height;

        const outputContext = output.getContext("2d", { willReadFrequently: true });
        if (!outputContext) return;

        outputContext.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
        const outputData = outputContext.getImageData(0, 0, width, height);
        const outputPixels = outputData.data;

        for (let offset = 0; offset < outputPixels.length; offset += 4) {
          const red = outputPixels[offset];
          const green = outputPixels[offset + 1];
          const blue = outputPixels[offset + 2];
          const maxChannel = Math.max(red, green, blue);
          const minChannel = Math.min(red, green, blue);
          const neutral = maxChannel - minChannel <= 22;
          const brightness = (red + green + blue) / 3;

          if (neutral && brightness >= 238) {
            outputPixels[offset + 3] = 0;
          } else if (neutral && brightness >= 210) {
            const opacity = Math.max(0, Math.min(1, (238 - brightness) / 28));
            outputPixels[offset + 3] = Math.round(outputPixels[offset + 3] * opacity);
          }
        }

        outputContext.putImageData(outputData, 0, 0);
        image.dataset.originalInstitutionLogo = source;
        image.dataset.transparentInstitutionLogo = "true";
        image.src = output.toDataURL("image/png");
        image.style.background = "transparent";
      } catch (error) {
        console.warn("Unable to prepare transparent institution logo:", error);
      }
    };

    if (image.complete && image.naturalWidth) process();
    else image.addEventListener("load", process, { once: true });
  }

  function prepareInstitutionLogos(doc) {
    doc?.querySelectorAll("#page-about .timeline-logo").forEach(createTransparentInstitutionLogo);
  }

  function scheduleInstitutionLogoPreparation(doc) {
    const win = doc?.defaultView;
    if (!win) return;

    const prepare = () => prepareInstitutionLogos(doc);
    win.requestAnimationFrame(() => {
      prepare();
      win.setTimeout(prepare, 120);
    });
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
    scheduleInstitutionLogoPreparation(doc);
  };
})();
