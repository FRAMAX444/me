(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;
  const pageIds = ["page-about", "page-publications", "page-works"];

  function removePageIntroCards(doc) {
    pageIds.forEach((pageId) => {
      const page = doc?.getElementById(pageId);
      const introCard = page?.querySelector(".container > .single-col > .card:first-child");
      introCard?.remove();
    });
  }

  function removeProjectImageTypeLabels(doc) {
    doc?.querySelectorAll("#page-works .json-project-media").forEach((media) => {
      if (!media.querySelector("img")) return;
      media.querySelector(".json-project-media-type")?.remove();
    });
  }

  preferences.install = async (frame) => {
    await installPreferences(frame);

    const doc = frame?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;

    removePageIntroCards(doc);
    removeProjectImageTypeLabels(doc);
  };
})();
