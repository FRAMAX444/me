(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const pageIds = ["page-about", "page-publications", "page-works"];
  const isText = (value) => typeof value === "string" && value.trim() !== "";
  const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function removePageIntroCards(doc) {
    pageIds.forEach((pageId) => {
      const page = doc?.getElementById(pageId);
      const introCard = page?.querySelector(".container > .single-col > .card:first-child");
      introCard?.remove();
    });
  }

  async function installAboutProfileCard(doc) {
    const page = doc?.getElementById("page-about");
    const singleCol = page?.querySelector(".container > .single-col");
    if (!singleCol || doc.getElementById("about-profile-card")) return;

    const response = await fetch("data/site-config.json", { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    const profile = data?.profile || {};
    const profilePhoto = data?.images?.profilePhoto;
    const hasPhoto = isText(profilePhoto);
    const name = isText(profile.name) ? profile.name.trim() : "";
    const role = isText(profile.role) ? profile.role.trim() : "";

    if (!hasPhoto && !name && !role) return;

    const card = doc.createElement("article");
    card.id = "about-profile-card";
    card.className = `about-profile-card card${hasPhoto ? "" : " no-photo"}`;
    card.innerHTML = `
      ${hasPhoto ? `
        <div class="about-profile-media">
          <img src="${escapeHtml(profilePhoto)}" alt="${escapeHtml(name || "Profile photo")}" loading="lazy">
        </div>
      ` : ""}
      <div class="about-profile-body">
        <div class="about-profile-eyebrow">About me</div>
        ${name ? `<h1 class="about-profile-name">${escapeHtml(name)}</h1>` : ""}
        ${role ? `<p class="about-profile-role">${escapeHtml(role)}</p>` : ""}
      </div>
    `;

    const firstSection = singleCol.querySelector(".section-divider");
    singleCol.insertBefore(card, firstSection || singleCol.firstChild);

    const image = card.querySelector(".about-profile-media img");
    image?.addEventListener("error", () => {
      card.querySelector(".about-profile-media")?.remove();
      card.classList.add("no-photo");
    }, { once: true });
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

    try {
      await installAboutProfileCard(doc);
    } catch (error) {
      console.warn("Unable to install the About profile card:", error);
    }

    try {
      await removeUnspecifiedProjectLabels(doc);
    } catch (error) {
      console.warn("Unable to clean optional project labels:", error);
    }
  };
})();