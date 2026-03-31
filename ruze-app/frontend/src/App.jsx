import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

const TRANSLATIONS = {
  cs: {
    title: "Klasifikátor Růží",
    subtitle: "Nahrajte fotografii a zjistěte druh růže",
    uploadPrompt: "Přetáhněte fotografii nebo klikněte pro výběr",
    uploadSub: "Podporované formáty: JPG, PNG, WEBP",
    capture: "Vyfotit",
    classify: "Klasifikovat",
    classifying: "Analyzuji…",
    result: "Výsledek",
    certainty: "Jistota",
    showConfidences: "Zobrazit jistoty",
    top1: "Nejpravděpodobnější druh",
    aboutTitle: "O druzích růží",
    aboutSub: "Průvodce čtyřmi druhy divoce rostoucích růží",
    mockWarning: "⚠ Model není nahrán – zobrazuji ukázková data.",
    tryAgain: "Nahrát jinou",
    lang: "EN",
    characteristics: "Znaky",
    habitat: "Výskyt",
  },
  en: {
    title: "Rose Classifier",
    subtitle: "Upload a photo to identify the rose species",
    uploadPrompt: "Drop a photo or click to browse",
    uploadSub: "Supported formats: JPG, PNG, WEBP",
    capture: "Take photo",
    classify: "Classify",
    classifying: "Analysing…",
    result: "Result",
    certainty: "Confidence",
    showConfidences: "Show confidences",
    top1: "Most likely species",
    aboutTitle: "About Rose Species",
    aboutSub: "A guide to four wild-growing rose species",
    mockWarning: "⚠ Model not loaded – showing sample data.",
    tryAgain: "Upload another",
    lang: "CS",
    characteristics: "Characteristics",
    habitat: "Habitat",
  },
};

const ROSES = {
  cs: [
    {
      key: "Rosa_canina",
      name: "Růže šípková",
      latin: "Rosa canina",
      emoji: "🌸",
      color: "#e8a0b0",
      characteristics: [
        "Výška 1–3 m, obloukovité větve s háčkovitými trny",
        "Listy lichozpeřené, 5–7 lístků, ostře pilovitě zubaté",
        "Květ světle růžový až bílý, 4–6 cm, vůně slabá",
        "Plod (šípek) červený, vejčitý, bohatý na vitamín C",
      ],
      habitat:
        "Rozšířena po celé Evropě a Asii. Roste na okrajích lesů, v křovinách, na mezích, podél cest a na slunných svazích do 2000 m n. m.",
    },
    {
      key: "Rosa_multiflora",
      name: "Růže mnohokvětá",
      latin: "Rosa multiflora",
      emoji: "🌺",
      color: "#f4c2c2",
      characteristics: [
        "Keř do 3 m, hojné šídlovité trny, větve obloukovité",
        "Listy 7–9 pilovitých lístků, stipuly hluboce třásnitě dělené",
        "Květy bílé až bledě růžové, drobné (1,5–2,5 cm), v hustých latách",
        "Plody kulaté, červené, drobné (cca 6 mm), přetrvávají přes zimu",
      ],
      habitat:
        "Pochází z východní Asie (Japonsko, Korea, Čína). V Evropě a Severní Americe zplaněla a místy invazně šíří. Preferuje narušené půdy, křoviny, břehy.",
    },
    {
      key: "Rosa_rugosa",
      name: "Růže svraskalá",
      latin: "Rosa rugosa",
      emoji: "🌹",
      color: "#d4607a",
      characteristics: [
        "Robustní keř 1–2 m, husté ostré trny různé délky",
        "Listy tmavozelené, výrazně svraštělé (rugózní), 5–9 lístků",
        "Květ tmavě růžový až purpurový, 6–9 cm, výrazně voní",
        "Šípky velké (2–3 cm), tmavočervené, masité, jedlé",
      ],
      habitat:
        "Původem z Dálného východu (Japonsko, Korea, severní Čína). Vysazována na pobřežních dunách a svazích; silně zplaněla v celé Evropě i Severní Americe.",
    },
    {
      key: "Rosa_woodsii",
      name: "Růže Woodsova",
      latin: "Rosa woodsii",
      emoji: "💐",
      color: "#c8a0c8",
      characteristics: [
        "Keř 0,5–2 m, rovné trny pod palisty a na větvích",
        "Listy 5–9 matně modrošedozelených lístků, jemně pilovitých",
        "Květ růžový, 3–5 cm, vonný, okvětní lístky mírně vykrojené",
        "Šípky kulaté, jasně červené, drobné, přetrvávají přes zimu",
      ],
      habitat:
        "Domovina v západní Severní Americe, od Britské Kolumbie po Nové Mexiko. Roste na prérijních svazích, v říčních nivách a na horských svazích.",
    },
  ],
  en: [
    {
      key: "Rosa_canina",
      name: "Dog Rose",
      latin: "Rosa canina",
      emoji: "🌸",
      color: "#e8a0b0",
      characteristics: [
        "Height 1–3 m, arching branches with hooked prickles",
        "Pinnate leaves with 5–7 sharply serrated leaflets",
        "Pale pink to white flowers, 4–6 cm, faint fragrance",
        "Red oval hips, rich in vitamin C, persist into winter",
      ],
      habitat:
        "Widespread across Europe and Asia. Grows at woodland edges, hedgerows, roadsides, and sunny slopes up to 2000 m altitude.",
    },
    {
      key: "Rosa_multiflora",
      name: "Multiflora Rose",
      latin: "Rosa multiflora",
      emoji: "🌺",
      color: "#f4c2c2",
      characteristics: [
        "Shrub to 3 m, numerous slender prickles, arching canes",
        "Leaves with 7–9 serrated leaflets; stipules deeply fringed",
        "Small white to pale pink flowers (1.5–2.5 cm) in dense panicles",
        "Round red hips, tiny (~6 mm), persist through winter",
      ],
      habitat:
        "Native to East Asia (Japan, Korea, China). Naturalised and invasive in Europe and North America. Prefers disturbed soils, thickets, and stream banks.",
    },
    {
      key: "Rosa_rugosa",
      name: "Rugosa Rose",
      latin: "Rosa rugosa",
      emoji: "🌹",
      color: "#d4607a",
      characteristics: [
        "Robust shrub 1–2 m, densely set with prickles of varying length",
        "Dark green, deeply wrinkled (rugose) leaves with 5–9 leaflets",
        "Deep pink to magenta flowers, 6–9 cm, strongly fragrant",
        "Large hips (2–3 cm), dark red, fleshy, edible",
      ],
      habitat:
        "Native to Far East (Japan, Korea, N. China). Planted on coastal dunes; now widely naturalised across Europe and North America.",
    },
    {
      key: "Rosa_woodsii",
      name: "Wood's Rose",
      latin: "Rosa woodsii",
      emoji: "💐",
      color: "#c8a0c8",
      characteristics: [
        "Shrub 0.5–2 m, straight infrastipular prickles plus stem prickles",
        "Leaves with 5–9 dull blue-green leaflets, finely serrated",
        "Pink flowers 3–5 cm, fragrant, petals slightly notched",
        "Round bright-red hips, small, persistent through winter",
      ],
      habitat:
        "Native to western North America, from British Columbia to New Mexico. Grows on prairie slopes, river bottoms, and mountain hillsides.",
    },
  ],
};

export default function App() {
  const [lang, setLang] = useState("cs");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfidences, setShowConfidences] = useState(false);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const cameraRef = useRef(null);
  const t = TRANSLATIONS[lang];
  const roses = ROSES[lang];

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setImage(accepted[0]);
      setImageUrl(URL.createObjectURL(accepted[0]));
      setPredictions(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  const classify = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", image);
      const res = await fetch("/api/classify", { method: "POST", body: form });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setPredictions(data.predictions);
      setIsMock(data.mock);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const topPrediction = predictions?.[0];
  const topRose = topPrediction
    ? roses.find((r) => r.key === topPrediction.class)
    : null;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img src="/rose.svg" alt="rose logo" className="logo-img" />
            <div>
              <h1>{t.title}</h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>
          </div>
          <button
            className="lang-btn"
            onClick={() => setLang(lang === "cs" ? "en" : "cs")}
          >
            {t.lang}
          </button>
        </div>
      </header>

      <main className="main">
        {/* Upload Section */}
        <section className="upload-section">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "drag-active" : ""} ${imageUrl ? "has-image" : ""}`}
          >
            <input {...getInputProps()} />
            {imageUrl ? (
              <div className="preview-wrap">
                <img src={imageUrl} alt="preview" className="preview-img" />
                <div className="preview-overlay">
                  <span>↺ {t.tryAgain}</span>
                </div>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="upload-icon">⬆</div>
                <p className="upload-prompt">{t.uploadPrompt}</p>
                <p className="upload-sub">{t.uploadSub}</p>
              </div>
            )}
          </div>

          {imageUrl && !predictions && (
            <button
              className="classify-btn"
              onClick={classify}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-wrap">
                  <span className="spinner" /> {t.classifying}
                </span>
              ) : (
                t.classify
              )}
            </button>
          )}
        </section>

        {/* Results */}
        {predictions && (
          <section className="results-section">
            {isMock && <div className="mock-warning">{t.mockWarning}</div>}

            {topRose && (
              <div
                className="result-card"
                style={{ "--rose-color": topRose.color }}
              >
                <div className="result-emoji">{topRose.emoji}</div>
                <div className="result-info">
                  <span className="result-label">{t.top1}</span>
                  <h2 className="result-name">{topRose.name}</h2>
                  <em className="result-latin">{topRose.latin}</em>
                  <div className="result-prob">
                    <div className="prob-bar-track">
                      <div
                        className="prob-bar-fill"
                        style={{
                          width: `${(topPrediction.probability * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                    <span className="prob-text">
                      {(topPrediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="confidence-toggle-wrap">
              <button
                className="confidence-toggle"
                onClick={() => setShowConfidences(!showConfidences)}
              >
                {t.showConfidences}{" "}
                <span className={`arrow ${showConfidences ? "open" : ""}`}>
                  ▾
                </span>
              </button>

              {showConfidences && (
                <div className="confidence-list">
                  {predictions.map((p) => {
                    const r = roses.find((r) => r.key === p.class);
                    const pct = (p.probability * 100).toFixed(1);
                    return (
                      <div key={p.class} className="conf-row">
                        <span className="conf-emoji">{r?.emoji || "🌿"}</span>
                        <span className="conf-name">
                          {r?.name || p.class}
                          <em> {r?.latin}</em>
                        </span>
                        <div className="conf-bar-track">
                          <div
                            className="conf-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: r?.color || "#aaa",
                            }}
                          />
                        </div>
                        <span className="conf-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              className="try-again-btn"
              onClick={() => {
                setImage(null);
                setImageUrl(null);
                setPredictions(null);
              }}
            >
              ← {t.tryAgain}
            </button>
          </section>
        )}

        {error && <div className="error-box">⚠ {error}</div>}

        {/* About Section */}
        <section className="about-section">
          <div className="about-header">
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutSub}</p>
          </div>
          <div className="roses-grid">
            {roses.map((rose) => (
              <div
                key={rose.key}
                className="rose-card"
                style={{ "--rose-color": rose.color }}
              >
                <div className="rose-card-top">
                  <span className="rose-emoji">{rose.emoji}</span>
                  <div>
                    <h3 className="rose-name">{rose.name}</h3>
                    <em className="rose-latin">{rose.latin}</em>
                  </div>
                </div>
                <div className="rose-section-label">{t.characteristics}</div>
                <ul className="rose-characteristics">
                  {rose.characteristics.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <div className="rose-section-label">{t.habitat}</div>
                <p className="rose-habitat">{rose.habitat}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>❋ Rosa Classifier — {lang === "cs" ? "Klasifikace pomocí CNN" : "CNN-based classification"}</span>
      </footer>
    </div>
  );
}
