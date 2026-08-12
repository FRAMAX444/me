(() => {
  "use strict";

  const enhanceHome = () => {
    const aboutSection = document.getElementById("about");
    const socialsSection = document.getElementById("socials");
    const aboutContainer = aboutSection?.querySelector(".container");
    const aboutCopy = aboutContainer?.querySelector(".about-copy");
    const portrait = document.querySelector(".hero .hero-photo-wrap");

    if (!aboutSection || !aboutContainer || !aboutCopy || !portrait) return false;

    let layout = aboutContainer.querySelector(".about-layout");
    if (!layout) {
      layout = document.createElement("div");
      layout.className = "about-layout";
      aboutCopy.before(layout);
      portrait.classList.add("about-portrait");
      layout.append(portrait, aboutCopy);
    }

    if (socialsSection && aboutSection.nextElementSibling !== socialsSection) {
      socialsSection.parentNode.insertBefore(aboutSection, socialsSection);
    }

    document.body.classList.add("home-layout-ready");
    return true;
  };

  if (enhanceHome()) return;

  const observer = new MutationObserver(() => {
    if (enhanceHome()) observer.disconnect();
  });

  observer.observe(document.getElementById("main") || document.body, {
    childList: true,
    subtree: true
  });
})();
