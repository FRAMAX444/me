(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const pageIds = ["page-about", "page-publications", "page-works"];
  const isText = (value) => typeof value === "string" && value.trim() !== "";
  const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

  function removePageIntroCards(doc) {
    pageIds.forEach((pageId) => {
      const page = doc?.getElementById(pageId);
      const introCard = page?.querySelector(".container > .single-col > .card:first-child");
      introCard?.remove();
    });
  }

  function installAboutMediaOverrides(doc) {
    if (doc.getElementById("about-media-overrides")) return;

    const style = doc.createElement("style");
    style.id = "about-media-overrides";
    style.textContent = `
      .about-timeline-card:not(.about-language-card) .about-timeline-media {
        background-image: none !important;
        transition: background-color .2s ease;
      }

      @media (max-width: 760px) {
        .about-timeline-card:not(.about-language-card) .about-timeline-media .timeline-logo,
        .about-timeline-card:not(.about-language-card).has-open-item .about-timeline-media .timeline-logo {
          width: 66.6667% !important;
          max-width: 66.6667% !important;
          max-height: 160px !important;
        }
      }

      /* Override legacy light-only surfaces when the dark theme is active. */
      :root[data-theme="dark"] .feed-body {
        background: #141b23 !important;
        border-color: #2d3947 !important;
        color: var(--text) !important;
      }

      :root[data-theme="dark"] .subcard,
      :root[data-theme="dark"] .exam-item,
      :root[data-theme="dark"] .repo-card {
        background: #1b2430 !important;
        border-color: #344252 !important;
        color: var(--text) !important;
        box-shadow: none;
      }

      :root[data-theme="dark"] .subcard > .stack-col > div,
      :root[data-theme="dark"] .subcard .stack-col > div[style*="background:#fff"],
      :root[data-theme="dark"] .subcard .stack-col > div[style*="background: #fff"],
      :root[data-theme="dark"] .subcard .stack-col > div[style*="background:#ffffff"],
      :root[data-theme="dark"] .subcard .stack-col > div[style*="background: #ffffff"] {
        background: #202b37 !important;
        border-color: #3a4858 !important;
        color: #eef3f8 !important;
      }

      :root[data-theme="dark"] .subcard h4,
      :root[data-theme="dark"] .subcard h5,
      :root[data-theme="dark"] .subcard strong,
      :root[data-theme="dark"] .exam-name,
      :root[data-theme="dark"] .repo-card h3 {
        color: #eef3f8 !important;
      }

      :root[data-theme="dark"] .notice,
      :root[data-theme="dark"] .feed-summary,
      :root[data-theme="dark"] .repo-card p,
      :root[data-theme="dark"] .abstract-preview-text,
      :root[data-theme="dark"] .json-project-description {
        color: #c4cfdb !important;
      }

      :root[data-theme="dark"] .meta,
      :root[data-theme="dark"] .json-project-meta,
      :root[data-theme="dark"] .timeline-org-meta {
        color: #aebdcb !important;
      }

      :root[data-theme="dark"] .education-final-grade,
      :root[data-theme="dark"] .education-average-grade,
      :root[data-theme="dark"] .experience-preview-pill,
      :root[data-theme="dark"] .skills-more summary,
      :root[data-theme="dark"] .json-project-status {
        background: #142c43 !important;
        border-color: #315b85 !important;
        color: #9bceff !important;
        box-shadow: none !important;
      }

      :root[data-theme="dark"] .skill-chip,
      :root[data-theme="dark"] .exam-project-link,
      :root[data-theme="dark"] .exam-project-chip,
      :root[data-theme="dark"] .repo-link,
      :root[data-theme="dark"] .json-project-link:not(.primary),
      :root[data-theme="dark"] .json-project-tag,
      :root[data-theme="dark"] code {
        background: #202b37 !important;
        border-color: #3a4858 !important;
        color: #dbe7f3 !important;
        box-shadow: none !important;
      }

      :root[data-theme="dark"] .timeline-item + .timeline-item,
      :root[data-theme="dark"] .skills-more,
      :root[data-theme="dark"] .exam-project-row {
        border-color: #2d3947 !important;
      }

      :root[data-theme="dark"] .timeline-items::before {
        background: #344252 !important;
      }

      :root[data-theme="dark"] .timeline-item::before {
        border-color: #151d26 !important;
        box-shadow: 0 0 0 1px #405064 !important;
      }
    `;
    doc.head.appendChild(style);
  }

  function syncAboutTimelineExpansion(card) {
    card.classList.toggle("has-open-item", Boolean(card.querySelector(".feed-card.open")));
  }

  function observeAboutTimelineExpansion(card) {
    card.aboutTimelineObserver?.disconnect();

    const Observer = card.ownerDocument?.defaultView?.MutationObserver || MutationObserver;
    const observer = new Observer((mutations) => {
      const feedCardChanged = mutations.some((mutation) =>
        mutation.type === "attributes" &&
        mutation.attributeName === "class" &&
        mutation.target.classList?.contains("feed-card")
      );

      if (feedCardChanged) syncAboutTimelineExpansion(card);
    });

    observer.observe(card, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    card.aboutTimelineObserver = observer;
    syncAboutTimelineExpansion(card);
  }

  function prepareLanguageHeader(header) {
    const title = header.querySelector(".timeline-org-title");
    const meta = header.querySelector(".timeline-org-meta");

    title?.classList.add("about-language-name");

    if (!meta) return;

    [...meta.children].slice(1).forEach((detail) => detail.remove());
    meta.firstElementChild?.classList.add("about-language-level");
  }

  function quantizeColor(red, green, blue) {
    const step = 16;
    return [red, green, blue].map((value) => Math.round(value / step) * step);
  }

  function sampleImageEdgeColor(image) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return null;

    const maxSize = 160;
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const canvas = image.ownerDocument.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    try {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const counts = new Map();
      const edgeDepth = Math.max(1, Math.round(Math.min(canvas.width, canvas.height) * .06));
      const sampleStep = Math.max(1, Math.floor(Math.max(canvas.width, canvas.height) / 80));

      const recordPixel = (x, y) => {
        const offset = (y * canvas.width + x) * 4;
        const alpha = pixels[offset + 3];
        if (alpha < 32) return;

        const [red, green, blue] = quantizeColor(
          pixels[offset],
          pixels[offset + 1],
          pixels[offset + 2]
        );
        const key = `${red},${green},${blue}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      };

      for (let x = 0; x < canvas.width; x += sampleStep) {
        for (let depth = 0; depth < edgeDepth; depth += 1) {
          recordPixel(x, depth);
          recordPixel(x, canvas.height - 1 - depth);
        }
      }

      for (let y = 0; y < canvas.height; y += sampleStep) {
        for (let depth = 0; depth < edgeDepth; depth += 1) {
          recordPixel(depth, y);
          recordPixel(canvas.width - 1 - depth, y);
        }
      }

      const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (!dominant) return null;

      const [red, green, blue] = dominant.split(",").map(Number);
      const nearlyWhite = red >= 240 && green >= 240 && blue >= 240;
      return nearlyWhite ? "#ffffff" : `rgb(${red}, ${green}, ${blue})`;
    } catch (error) {
      console.warn("Unable to sample organization image colors:", error);
      return null;
    }
  }

  function matchMediaBackgroundToImage(media, image) {
    const applyColor = () => {
      const color = sampleImageEdgeColor(image);
      if (color) media.style.backgroundColor = color;
    };

    if (image.complete && image.naturalWidth) {
      applyColor();
    } else {
      image.addEventListener("load", applyColor, { once: true });
    }
  }

  function transformAboutTimelineCards(doc) {
    doc?.getElementById("about-profile-card")?.remove();
    doc?.getElementById("language-skills-list")?.classList.add("about-language-grid");
    installAboutMediaOverrides(doc);

    doc?.querySelectorAll("#page-about .timeline-group").forEach((card) => {
      if (card.dataset.projectMediaLayout === "true") return;

      const isLanguageCard = Boolean(card.closest("#language-skills-list"));
      const children = [...card.children];
      const header = children.find((child) => child.classList.contains("timeline-org-head"));
      const items = children.find((child) => child.classList.contains("timeline-items"));
      if (!header) return;

      if (isLanguageCard) prepareLanguageHeader(header);

      const logo = header.querySelector(".timeline-logo");
      const content = doc.createElement("div");
      content.className = "about-timeline-content";
      content.appendChild(header);

      if (items && !isLanguageCard) {
        content.appendChild(items);
      }

      const fragment = doc.createDocumentFragment();

      if (logo) {
        const media = doc.createElement("div");
        media.className = "about-timeline-media";
        media.appendChild(logo);
        fragment.appendChild(media);

        if (!isLanguageCard) {
          matchMediaBackgroundToImage(media, logo);
        }

        logo.addEventListener("error", () => {
          media.remove();
          card.classList.add("no-media");
        }, { once: true });
      } else {
        card.classList.add("no-media");
      }

      fragment.appendChild(content);
      card.replaceChildren(fragment);
      card.classList.add("about-timeline-card");

      if (isLanguageCard) {
        card.classList.add("about-language-card");
      }

      card.dataset.projectMediaLayout = "true";

      if (!isLanguageCard) {
        observeAboutTimelineExpansion(card);
      }
    });
  }

  function getFirstConfiguredMedia(project = {}) {
    if (isText(project.image)) return null;

    const media = asArray(project.media);
    if (media.length) return media[0];

    const images = asArray(project.images);
    return images.length ? images[0] : null;
  }

  async function removeUnspecifiedProjectLabels(doc) {
    const response = await fetch("data/projects.json", { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    const projectsByTitle = new Map(
      asArray(data?.projects)
        .filter((project) => project && project.enabled !== false && isText(project.title))
        .map((project) => [project.title.trim(), project])
    );

    doc?.querySelectorAll("#page-works .json-project-card").forEach((card) => {
      const title = card.querySelector(".json-project-heading h3")?.textContent?.trim();
      const project = projectsByTitle.get(title);
      if (!project) return;

      const firstMedia = getFirstConfiguredMedia(project);
      const hasExplicitMediaType = firstMedia && typeof firstMedia === "object" && isText(firstMedia.type);

      if (!hasExplicitMediaType) {
        card.querySelector(".json-project-media-type")?.remove();
      }

      if (!isText(project.status)) {
        card.querySelector(".json-project-status")?.remove();
      }
    });
  }

  preferences.install = async (frame) => {
    await installPreferences(frame);

    const doc = frame?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;

    removePageIntroCards(doc);
    transformAboutTimelineCards(doc);

    try {
      await removeUnspecifiedProjectLabels(doc);
    } catch (error) {
      console.warn("Unable to clean optional project labels:", error);
    }
  };
})();