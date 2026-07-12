(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const isText = (value) => typeof value === "string" && value.trim() !== "";
  const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

  function getFirstConfiguredMedia(project = {}) {
    if (isText(project.image)) return null;

    const media = asArray(project.media);
    if (media.length) return media[0];

    const images = asArray(project.images);
    return images.length ? images[0] : null;
  }

  async function cleanProjectLabels(doc) {
    const response = await fetch("data/projects.json", { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    const projectsByTitle = new Map(
      asArray(data?.projects)
        .filter((project) => project && project.enabled !== false && isText(project.title))
        .map((project) => [project.title.trim(), project])
    );

    doc?.querySelectorAll("#page-works .json-project-card").forEach((card) => {
      const sourceTitle = card.querySelector("[data-json-gallery]")?.dataset.title?.trim();
      const visibleTitle = card.querySelector(".json-project-heading h3")?.textContent?.trim();
      const project = projectsByTitle.get(sourceTitle) || projectsByTitle.get(visibleTitle);
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

    try {
      await cleanProjectLabels(doc);
    } catch (error) {
      console.warn("Unable to clean translated project labels:", error);
    }
  };
})();
