(() => {
  const preferences = window.PortfolioPreferences;
  if (!preferences?.install) return;

  const installPreferences = preferences.install;

  function installFixStyles(doc) {
    if (!doc?.head || doc.getElementById("portfolio-preferences-fixes")) return;

    const link = doc.createElement("link");
    link.id = "portfolio-preferences-fixes";
    link.rel = "stylesheet";
    link.href = "assets/preferences-fixes.css";
    doc.head.appendChild(link);
  }

  function moveControlsToLanding(doc) {
    const controls = doc?.getElementById("portfolio-controls");
    const landing = doc?.querySelector("#page-home .home-hero-content");
    if (!controls || !landing) return;

    let wrapper = doc.getElementById("portfolio-controls-wrap");
    if (!wrapper) {
      wrapper = doc.createElement("div");
      wrapper.id = "portfolio-controls-wrap";
      wrapper.className = "portfolio-controls-wrap";
      wrapper.dataset.noTranslate = "true";
      landing.prepend(wrapper);
    }

    wrapper.appendChild(controls);
  }

  preferences.install = async (frame) => {
    await installPreferences(frame);

    const doc = frame?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;

    installFixStyles(doc);
    moveControlsToLanding(doc);
  };
})();
