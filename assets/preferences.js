(() => {
  const SUPPORTED_LANGUAGES = ["en", "it", "es", "fr", "de"];
  const LANGUAGE_NAMES = {
    en: "English",
    it: "Italiano",
    es: "Español",
    fr: "Français",
    de: "Deutsch"
  };
  const STORAGE_LANGUAGE = "portfolio-language";
  const STORAGE_THEME = "portfolio-theme";
  const PACK_BASE = "data/i18n";
  const PACK_PARTS = {
    en: ["en"],
    it: ["it-1", "it-2", "it-3", "it-4"],
    es: ["es-1", "es-2", "es-3", "es-4"],
    fr: ["fr-1", "fr-2", "fr-3", "fr-4"],
    de: ["de-1", "de-2", "de-3", "de-4"]
  };

  const UI = {
    en: {
      language: "Language",
      light: "Light",
      dark: "Dark",
      loading: "Loading portfolio…",
      switchToDark: "Switch to dark mode",
      switchToLight: "Switch to light mode",
      portfolioUnavailable: "Portfolio unavailable",
      portfolioUnavailableDetail: "Unable to load the page structure.",
      projectsUnavailable: "Portfolio unavailable",
      projectsUnavailableDetail: "Check the data files and reload the page."
    },
    it: {
      language: "Lingua",
      light: "Chiaro",
      dark: "Scuro",
      loading: "Caricamento portfolio…",
      switchToDark: "Passa alla modalità scura",
      switchToLight: "Passa alla modalità chiara",
      portfolioUnavailable: "Portfolio non disponibile",
      portfolioUnavailableDetail: "Impossibile caricare la struttura della pagina.",
      projectsUnavailable: "Portfolio non disponibile",
      projectsUnavailableDetail: "Controlla i file dati e ricarica la pagina."
    },
    es: {
      language: "Idioma",
      light: "Claro",
      dark: "Oscuro",
      loading: "Cargando portfolio…",
      switchToDark: "Cambiar al modo oscuro",
      switchToLight: "Cambiar al modo claro",
      portfolioUnavailable: "Portfolio no disponible",
      portfolioUnavailableDetail: "No se ha podido cargar la estructura de la página.",
      projectsUnavailable: "Portfolio no disponible",
      projectsUnavailableDetail: "Comprueba los archivos de datos y vuelve a cargar la página."
    },
    fr: {
      language: "Langue",
      light: "Clair",
      dark: "Sombre",
      loading: "Chargement du portfolio…",
      switchToDark: "Passer en mode sombre",
      switchToLight: "Passer en mode clair",
      portfolioUnavailable: "Portfolio indisponible",
      portfolioUnavailableDetail: "Impossible de charger la structure de la page.",
      projectsUnavailable: "Portfolio indisponible",
      projectsUnavailableDetail: "Vérifiez les fichiers de données puis rechargez la page."
    },
    de: {
      language: "Sprache",
      light: "Hell",
      dark: "Dunkel",
      loading: "Portfolio wird geladen…",
      switchToDark: "Zum Dunkelmodus wechseln",
      switchToLight: "Zum Hellmodus wechseln",
      portfolioUnavailable: "Portfolio nicht verfügbar",
      portfolioUnavailableDetail: "Die Seitenstruktur konnte nicht geladen werden.",
      projectsUnavailable: "Portfolio nicht verfügbar",
      projectsUnavailableDetail: "Prüfe die Datendateien und lade die Seite neu."
    }
  };

  const MONTHS = {
    it: {
      january: "gennaio", february: "febbraio", march: "marzo", april: "aprile",
      may: "maggio", june: "giugno", july: "luglio", august: "agosto",
      september: "settembre", october: "ottobre", november: "novembre", december: "dicembre"
    },
    es: {
      january: "enero", february: "febrero", march: "marzo", april: "abril",
      may: "mayo", june: "junio", july: "julio", august: "agosto",
      september: "septiembre", october: "octubre", november: "noviembre", december: "diciembre"
    },
    fr: {
      january: "janvier", february: "février", march: "mars", april: "avril",
      may: "mai", june: "juin", july: "juillet", august: "août",
      september: "septembre", october: "octobre", november: "novembre", december: "décembre"
    },
    de: {
      january: "Januar", february: "Februar", march: "März", april: "April",
      may: "Mai", june: "Juni", july: "Juli", august: "August",
      september: "September", october: "Oktober", november: "November", december: "Dezember"
    }
  };

  const PATTERNS = {
    it: [
      [/\bPresent\b/gi, "Presente"],
      [/\(expected\)/gi, "(previsto)"],
      [/\bwith honours\b/gi, "con lode"],
      [/\bqualified\b/gi, "idoneo"],
      [/\bNative\b/g, "Madrelingua"],
      [/\bLevel\b/g, "Livello"],
      [/\bRome, Italy\b/g, "Roma, Italia"],
      [/\bRome\b/g, "Roma"],
      [/\bItaly\b/g, "Italia"],
      [/\bAverage grade:\s*/g, "Media ponderata: "],
      [/\bForks\s*/g, "Fork "]
    ],
    es: [
      [/\bPresent\b/gi, "Actualidad"],
      [/\(expected\)/gi, "(previsto)"],
      [/\bwith honours\b/gi, "con honores"],
      [/\bqualified\b/gi, "apto"],
      [/\bNative\b/g, "Nativo"],
      [/\bLevel\b/g, "Nivel"],
      [/\bRome, Italy\b/g, "Roma, Italia"],
      [/\bRome\b/g, "Roma"],
      [/\bItaly\b/g, "Italia"],
      [/\bAverage grade:\s*/g, "Nota media ponderada: "],
      [/\bForks\s*/g, "Bifurcaciones "]
    ],
    fr: [
      [/\bPresent\b/gi, "Aujourd’hui"],
      [/\(expected\)/gi, "(prévu)"],
      [/\bwith honours\b/gi, "avec mention très bien"],
      [/\bqualified\b/gi, "validé"],
      [/\bNative\b/g, "Langue maternelle"],
      [/\bLevel\b/g, "Niveau"],
      [/\bRome, Italy\b/g, "Rome, Italie"],
      [/\bItaly\b/g, "Italie"],
      [/\bAverage grade:\s*/g, "Moyenne pondérée : "],
      [/\bForks\s*/g, "Forks "]
    ],
    de: [
      [/\bPresent\b/gi, "Heute"],
      [/\(expected\)/gi, "(voraussichtlich)"],
      [/\bwith honours\b/gi, "mit Auszeichnung"],
      [/\bqualified\b/gi, "bestanden"],
      [/\bNative\b/g, "Muttersprache"],
      [/\bLevel\b/g, "Niveau"],
      [/\bRome, Italy\b/g, "Rom, Italien"],
      [/\bRome\b/g, "Rom"],
      [/\bItaly\b/g, "Italien"],
      [/\bAverage grade:\s*/g, "Gewichteter Notendurchschnitt: "],
      [/\bForks\s*/g, "Forks "]
    ]
  };

  const state = {
    frame: null,
    doc: null,
    language: resolveLanguage(),
    theme: resolveTheme(),
    packs: new Map(),
    pack: {},
    observer: null,
    originalText: new WeakMap(),
    translatedText: new WeakMap(),
    originalAttributes: new WeakMap(),
    translatedAttributes: new WeakMap()
  };

  function resolveLanguage() {
    const stored = localStorage.getItem(STORAGE_LANGUAGE);
    if (SUPPORTED_LANGUAGES.includes(stored)) return stored;

    const browserLanguage = (navigator.languages || [navigator.language || "en"])
      .map((value) => String(value).toLowerCase().split("-")[0])
      .find((value) => SUPPORTED_LANGUAGES.includes(value));

    return browserLanguage || "en";
  }

  function resolveTheme() {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function ui(key, language = state.language) {
    return UI[language]?.[key] || UI.en[key] || key;
  }

  function translateHost(key) {
    return ui(key);
  }

  function normalizeKey(value) {
    return String(value ?? "")
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function loadPack(language) {
    if (state.packs.has(language)) return state.packs.get(language);

    try {
      const partNames = PACK_PARTS[language] || PACK_PARTS.en;
      const responses = await Promise.all(
        partNames.map((part) => fetch(`${PACK_BASE}/${part}.json`, { cache: "no-store" }))
      );
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error(`Translation pack ${language}: ${failed.status}`);
      const parts = await Promise.all(responses.map((response) => response.json()));
      const strings = Object.assign({}, ...parts.map((part) => part?.strings || {}));
      state.packs.set(language, strings);
      return strings;
    } catch (error) {
      console.warn("Unable to load translation pack:", error);
      state.packs.set(language, {});
      return {};
    }
  }

  function translateMonths(value, language) {
    const months = MONTHS[language];
    if (!months) return value;

    let translated = value;
    Object.entries(months).forEach(([english, localized]) => {
      translated = translated.replace(new RegExp(`\\b${english}\\b`, "gi"), localized);
    });
    return translated;
  }

  function translateDynamic(value, language) {
    if (language === "en") return value;

    let translated = translateMonths(value, language);
    for (const [pattern, replacement] of PATTERNS[language] || []) {
      translated = translated.replace(pattern, replacement);
    }

    const openGallery = translated.match(/^Open (.+) gallery$/i);
    if (openGallery) {
      const subject = openGallery[1];
      if (language === "it") return `Apri la galleria di ${subject}`;
      if (language === "es") return `Abrir la galería de ${subject}`;
      if (language === "fr") return `Ouvrir la galerie de ${subject}`;
      if (language === "de") return `Galerie „${subject}“ öffnen`;
    }

    const numberedImage = translated.match(/^(.+?)\s+(\d+)$/);
    if (numberedImage) {
      const base = translateValue(numberedImage[1], language);
      if (base !== numberedImage[1]) return `${base} ${numberedImage[2]}`;
    }

    return translated;
  }

  function translateValue(value, language = state.language) {
    if (!value) return value;

    const source = String(value);
    const normalized = normalizeKey(source);
    if (!normalized) return source;

    const direct = state.pack[normalized];
    if (typeof direct === "string" && direct) return direct;

    const quoted = source.match(/^“([\s\S]+)”$/);
    if (quoted) {
      const inner = translateValue(quoted[1], language);
      if (inner !== quoted[1]) return `“${inner}”`;
    }

    if (source.includes(" • ")) {
      return source
        .split(" • ")
        .map((part) => translateValue(part, language))
        .join(" • ");
    }

    return translateDynamic(source, language);
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest("script, style, noscript, textarea, pre, [data-no-translate]"));
  }

  function translateTextNode(node, refreshOriginal = false) {
    if (!node || shouldSkipTextNode(node) || !node.data.trim()) return;

    if (refreshOriginal || !state.originalText.has(node)) {
      state.originalText.set(node, node.data);
    }

    const original = state.originalText.get(node);
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const coreEnd = Math.max(leading.length, original.length - trailing.length);
    const core = original.slice(leading.length, coreEnd);
    const translated = `${leading}${translateValue(core)}${trailing}`;

    if (node.data !== translated) node.data = translated;
    state.translatedText.set(node, translated);
  }

  function attributeMap(store, element) {
    if (!store.has(element)) store.set(element, new Map());
    return store.get(element);
  }

  function translateAttributes(element, refreshOriginal = false) {
    if (!(element instanceof state.doc.defaultView.Element) || element.closest("[data-no-translate]")) return;

    ["aria-label", "title", "alt", "placeholder"].forEach((name) => {
      if (!element.hasAttribute(name)) return;

      const originals = attributeMap(state.originalAttributes, element);
      const translatedValues = attributeMap(state.translatedAttributes, element);
      if (refreshOriginal || !originals.has(name)) originals.set(name, element.getAttribute(name));

      const original = originals.get(name);
      const translated = translateValue(original);
      if (element.getAttribute(name) !== translated) element.setAttribute(name, translated);
      translatedValues.set(name, translated);
    });
  }

  function translateSubtree(root, refreshOriginal = false) {
    if (!state.doc || !root) return;

    const NodeCtor = state.doc.defaultView.Node;
    if (root.nodeType === NodeCtor.TEXT_NODE) {
      translateTextNode(root, refreshOriginal);
      return;
    }

    if (root.nodeType !== NodeCtor.ELEMENT_NODE && root.nodeType !== NodeCtor.DOCUMENT_NODE) return;

    if (root.nodeType === NodeCtor.ELEMENT_NODE) translateAttributes(root, refreshOriginal);

    const walker = state.doc.createTreeWalker(
      root,
      state.doc.defaultView.NodeFilter.SHOW_ELEMENT | state.doc.defaultView.NodeFilter.SHOW_TEXT
    );

    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === NodeCtor.TEXT_NODE) translateTextNode(node, refreshOriginal);
      else translateAttributes(node, refreshOriginal);
      node = walker.nextNode();
    }
  }

  function applyTranslations() {
    if (!state.doc) return;
    state.doc.documentElement.lang = state.language;
    state.doc.documentElement.dataset.language = state.language;
    document.documentElement.lang = state.language;
    translateSubtree(state.doc.body);
    updateControls();
  }

  function applyTheme(theme, persist = false) {
    state.theme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = state.theme;

    if (state.doc) {
      state.doc.documentElement.dataset.theme = state.theme;
      state.doc.documentElement.style.colorScheme = state.theme;
    }

    if (persist) localStorage.setItem(STORAGE_THEME, state.theme);
    updateControls();
  }

  async function setLanguage(language, persist = true) {
    state.language = SUPPORTED_LANGUAGES.includes(language) ? language : "en";
    state.pack = await loadPack(state.language);
    if (persist) localStorage.setItem(STORAGE_LANGUAGE, state.language);
    applyTranslations();
  }

  function toggleTheme() {
    applyTheme(state.theme === "dark" ? "light" : "dark", true);
  }

  function updateControls() {
    if (!state.doc) return;
    const select = state.doc.getElementById("portfolio-language-select");
    const button = state.doc.getElementById("portfolio-theme-toggle");
    const label = state.doc.getElementById("portfolio-language-label");

    if (select) {
      select.value = state.language;
      select.setAttribute("aria-label", ui("language"));
      select.title = ui("language");
    }

    if (label) label.textContent = ui("language");

    if (button) {
      const switchLabel = state.theme === "dark" ? ui("switchToLight") : ui("switchToDark");
      button.setAttribute("aria-label", switchLabel);
      button.title = switchLabel;
      button.innerHTML = state.theme === "dark"
        ? `<span aria-hidden="true">☀️</span><span class="portfolio-theme-label">${ui("light")}</span>`
        : `<span aria-hidden="true">🌙</span><span class="portfolio-theme-label">${ui("dark")}</span>`;
    }
  }

  function installStyles(doc) {
    if (doc.getElementById("portfolio-preferences-styles")) return;

    const link = doc.createElement("link");
    link.id = "portfolio-preferences-styles";
    link.rel = "stylesheet";
    link.href = "assets/preferences.css";
    doc.head.appendChild(link);
  }

  function installControls(doc) {
    const topbar = doc.querySelector(".topbar-inner");
    if (!topbar || doc.getElementById("portfolio-controls")) return;

    const controls = doc.createElement("div");
    controls.id = "portfolio-controls";
    controls.className = "portfolio-controls";
    controls.dataset.noTranslate = "true";
    controls.innerHTML = `
      <label id="portfolio-language-label" class="portfolio-control-label" for="portfolio-language-select">${ui("language")}</label>
      <select id="portfolio-language-select" class="portfolio-language-select">
        ${SUPPORTED_LANGUAGES.map((language) => `<option value="${language}">${LANGUAGE_NAMES[language]}</option>`).join("")}
      </select>
      <button id="portfolio-theme-toggle" class="portfolio-theme-toggle" type="button"></button>
    `;
    topbar.appendChild(controls);

    controls.querySelector("#portfolio-language-select").addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });
    controls.querySelector("#portfolio-theme-toggle").addEventListener("click", toggleTheme);
  }

  function installObserver(doc) {
    state.observer?.disconnect();

    const Observer = doc.defaultView.MutationObserver;
    if (!Observer) return;

    state.observer = new Observer((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const node = mutation.target;
          if (node.data === state.translatedText.get(node)) continue;
          translateTextNode(node, true);
          continue;
        }

        if (mutation.type === "attributes") {
          const element = mutation.target;
          const attr = mutation.attributeName;
          const translatedAttrs = state.translatedAttributes.get(element);
          if (translatedAttrs?.get(attr) === element.getAttribute(attr)) continue;
          translateAttributes(element, true);
          continue;
        }

        mutation.addedNodes.forEach((node) => translateSubtree(node));
      }
    });

    state.observer.observe(doc.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "alt", "placeholder"]
    });
  }

  async function install(frame) {
    const doc = frame?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;

    state.frame = frame;
    state.doc = doc;
    state.originalText = new WeakMap();
    state.translatedText = new WeakMap();
    state.originalAttributes = new WeakMap();
    state.translatedAttributes = new WeakMap();

    installStyles(doc);
    installControls(doc);
    applyTheme(state.theme, false);
    state.pack = await loadPack(state.language);
    applyTranslations();
    installObserver(doc);
  }

  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  systemTheme?.addEventListener?.("change", (event) => {
    if (!localStorage.getItem(STORAGE_THEME)) applyTheme(event.matches ? "dark" : "light", false);
  });

  window.PortfolioPreferences = {
    install,
    setLanguage,
    setTheme: (theme) => applyTheme(theme, true),
    translateHost,
    get language() { return state.language; },
    get theme() { return state.theme; }
  };
})();
