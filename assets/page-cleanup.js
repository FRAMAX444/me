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

  function transformAboutTimelineCards(doc) {
    doc?.getElementById("about-profile-card")?.remove();
    doc?.getElementById("language-skills-list")?.classList.add("about-language-grid");

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