(() => {
  const PROJECT_STRINGS = {
    en: {
      "Analisi calcistica · Modelli probabilistici": "Football analytics · Probabilistic models",
      "In sviluppo": "In development",
      "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.": "A static web app for predicting matches across the Champions League, Europa League, Conference League, and Europe’s five major domestic leagues. It combines recent form, Elo, xG, home/away performance, and a Poisson model with Dixon–Coles correction, showing 1X2 probabilities, exact scores, Over 2.5, and BTTS.",
      "Analisi calcistica": "Football analytics",
      "Sito web": "Live website",
      "Repository": "Repository",
      "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche": "Illustration of the European Match Predictor dashboard with probabilities and football analytics",
      "Anteprima generata del progetto": "Generated project preview"
    },
    it: {
      "Analisi calcistica · Modelli probabilistici": "Analisi calcistica · Modelli probabilistici",
      "In sviluppo": "In sviluppo",
      "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.": "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.",
      "Analisi calcistica": "Analisi calcistica",
      "Sito web": "Sito web",
      "Repository": "Repository",
      "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche": "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche",
      "Anteprima generata del progetto": "Anteprima generata del progetto"
    },
    es: {
      "Analisi calcistica · Modelli probabilistici": "Analítica de fútbol · Modelos probabilísticos",
      "In sviluppo": "En desarrollo",
      "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.": "Aplicación web estática para predecir partidos de la Champions League, la Europa League, la Conference League y las cinco principales ligas europeas. Combina forma reciente, Elo, xG, rendimiento como local y visitante y un modelo de Poisson con corrección Dixon–Coles, mostrando probabilidades 1X2, marcadores exactos, Más de 2,5 y BTTS.",
      "Analisi calcistica": "Analítica de fútbol",
      "Sito web": "Sitio web",
      "Repository": "Repositorio",
      "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche": "Ilustración del panel European Match Predictor con probabilidades y analítica de fútbol",
      "Anteprima generata del progetto": "Vista previa generada del proyecto"
    },
    fr: {
      "Analisi calcistica · Modelli probabilistici": "Analyse du football · Modèles probabilistes",
      "In sviluppo": "En développement",
      "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.": "Application web statique pour prédire les matchs de la Ligue des champions, de la Ligue Europa, de la Ligue Conférence et des cinq grands championnats européens. Elle combine la forme récente, l’Elo, les xG, les performances à domicile et à l’extérieur ainsi qu’un modèle de Poisson corrigé par Dixon–Coles, avec probabilités 1X2, scores exacts, Plus de 2,5 et BTTS.",
      "Analisi calcistica": "Analyse du football",
      "Sito web": "Site web",
      "Repository": "Dépôt",
      "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche": "Illustration du tableau de bord European Match Predictor avec probabilités et analyse du football",
      "Anteprima generata del progetto": "Aperçu généré du projet"
    },
    de: {
      "Analisi calcistica · Modelli probabilistici": "Fußballanalyse · Probabilistische Modelle",
      "In sviluppo": "In Entwicklung",
      "Web app statica per prevedere le partite di Champions League, Europa League, Conference League e dei cinque principali campionati europei. Combina forma recente, Elo, xG, rendimento casa/trasferta e un modello di Poisson con correzione Dixon–Coles, mostrando probabilità 1X2, punteggi esatti, Over 2.5 e BTTS.": "Statische Web-App zur Prognose von Spielen der Champions League, Europa League, Conference League und der fünf großen europäischen Ligen. Sie kombiniert aktuelle Form, Elo, xG, Heim- und Auswärtsleistung sowie ein Poisson-Modell mit Dixon–Coles-Korrektur und zeigt 1X2-Wahrscheinlichkeiten, exakte Ergebnisse, Über 2,5 und BTTS.",
      "Analisi calcistica": "Fußballanalyse",
      "Sito web": "Website",
      "Repository": "Repository",
      "Illustrazione del dashboard European Match Predictor con probabilità e analisi calcistiche": "Illustration des European-Match-Predictor-Dashboards mit Wahrscheinlichkeiten und Fußballanalysen",
      "Anteprima generata del progetto": "Generierte Projektvorschau"
    }
  };

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await nativeFetch(input, init);

    try {
      const rawUrl = typeof input === "string" ? input : input?.url;
      const url = new URL(rawUrl, window.location.href);
      if (!url.pathname.includes("/data/i18n/")) return response;

      const filename = url.pathname.split("/").pop() || "";
      const match = filename.match(/^(en|it|es|fr|de)(?:-\d+)?\.json$/);
      if (!match || !PROJECT_STRINGS[match[1]] || !response.ok) return response;

      const data = await response.clone().json();
      data.strings = {
        ...(data.strings || {}),
        ...PROJECT_STRINGS[match[1]]
      };

      const headers = new Headers(response.headers);
      headers.delete("content-length");
      headers.delete("content-encoding");
      headers.set("content-type", "application/json; charset=utf-8");

      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      console.warn("Unable to extend project translations:", error);
      return response;
    }
  };
})();
