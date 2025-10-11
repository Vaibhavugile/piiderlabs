// src/pages/TestDetailPage.js
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_TESTS,TestCard } from "../data/TestListingData";
import { useCart } from "../context/CartContext";
import "./TestDetailPage.css";

// small helper: normalize arrays
const normalizeToArray = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (val == null) return fallback;
  if (typeof val === "string") return val.split("\n").map(s => s.trim()).filter(Boolean);
  if (typeof val === "object") return Object.values(val);
  return fallback;
};

const TestDetailPage = () => {
  const params = useParams();
  const routeParam = params.testId || params.slug || params.id || Object.values(params)[0];
  const navigate = useNavigate();
  const goToCategory = (key) => navigate(`/tests?category=${encodeURIComponent(key)}`);
  const goToOrgan = (key) => navigate(`/tests?organ=${encodeURIComponent(key)}`);
  const goToConcern = (key) => navigate(`/tests?concern=${encodeURIComponent(key)}`);
  const goToSeason = (key) => navigate(`/tests?season=${encodeURIComponent(key)}`);

  // unconditionally call hook
  const cartCtx = useCart();
  const addItem = (cartCtx && cartCtx.addItem) || (() => { });
  const totalItems = (cartCtx && typeof cartCtx.totalItems === "number") ? cartCtx.totalItems : 0;

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const headerRef = useRef(null);
  const paramsRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    console.log("🔍 route param ->", routeParam);
  }, [routeParam]);

  useEffect(() => {
    setLoading(true);

    const found =
      MOCK_TESTS.find(t => String(t.slug) === String(routeParam)) ||
      MOCK_TESTS.find(t => String(t.id) === String(routeParam));

    console.log("🧪 found ->", found);

    if (found) {
      setTest(found);
    } else {
      setTest(null);
    }

    const timer = setTimeout(() => setLoading(false), 140);
    return () => clearTimeout(timer);
  }, [routeParam]);

  useEffect(() => {
    if (test) console.log("🧬 rendering ->", test.name);
  }, [test]);

  // simple handlers
  const handleAddToCart = () => {
    if (!test) return;
    addItem({ id: test.id, name: test.name, price: test.price || 0 });
    // small non-blocking notification
    // you can swap this for a nicer toast in your project
    alert(`${test.name} added to cart`);
  };

  const handleBookNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleBack = () => {
    // try to go back, otherwise go to tests listing
    if (window.history.length > 1) navigate(-1);
    else navigate("/tests");
  };

  // derived values & safe normalizations
  const safeTest = test || {};
  const details = safeTest.testDetails || {};
  const markers = normalizeToArray(details.markers, []);
  const preparationList = normalizeToArray(details.preparationDetails || safeTest.preparation || []);
  const whyTake = normalizeToArray(details.whyTakeTest || details.why || safeTest.why || []);
  const interpretationTable = normalizeToArray(details.interpretationTableData || details.results || []);
  const price = typeof safeTest.price === "number" ? safeTest.price : (safeTest.price ? Number(safeTest.price) : null);
  const mrpPrice = price ? ((price / 0.85) * 1.0).toFixed(2) : null;
  const bookedCount = safeTest.bookedCount || (safeTest.stats && safeTest.stats.bookedCount);

  if (loading) {
    return (
      <div className="detail-container loading-state" role="status" aria-live="polite">
        <div style={{ padding: 18 }}>
          <div style={{ height: 24, width: "40%", background: "#eee", borderRadius: 6 }} />
          <div style={{ height: 16, width: "30%", marginTop: 8, background: "#eee", borderRadius: 6 }} />
        </div>
        <div style={{ padding: 20 }}>
          <p>Loading test details…</p>
        </div>
      </div>
    );
  }

  if (!safeTest || !safeTest.name) {
    return (
      <div className="detail-container not-found" role="alert" style={{ padding: 36, textAlign: "center" }}>
        <h1>404 — Test Not Found</h1>
        <p>No test matches the route parameter <strong>{String(routeParam)}</strong>.</p>
        <div style={{ marginTop: 18 }}>
          <button onClick={() => navigate("/tests")} className="primary-button">View All Tests</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container" role="main" aria-labelledby="test-title">
      {/* BACK row: icon + small breadcrumb - visible and sticky at top of container */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button
          onClick={handleBack}
          className="back-button"
          aria-label="Go back to tests"
          title="Back"
        >
          {/* accessible SVG back icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#003049" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ fontWeight: 700, color: "var(--muted-blue)" }}>{safeTest.category || "Test Details"}</div>
      </div>

      {/* HERO */}
      <div ref={headerRef} className="td-hero">
        <div className="td-hero-left">
          <div className="logo-badge">🧪 PiiderLab</div>

          <h1 id="test-title" className="td-title">{safeTest.name}</h1>
          {Array.isArray(safeTest.includes) && safeTest.includes.length > 0 && (
            <p className="test-alias">Also Known As: {safeTest.includes.join(", ")}</p>
          )}

          {(details.about || safeTest.shortDescription) && (
            <p className="td-sub">{details.about || safeTest.shortDescription}</p>
          )}

          <div className="td-hero-meta" style={{ marginTop: 8 }}>
            {bookedCount && <span className="meta-badge">⭐ {bookedCount} booked</span>}
            {safeTest.reportTime && <span className="meta-text">⏱️ {safeTest.reportTime}</span>}
            {safeTest.sampleType && <span className="meta-text">🔬 {safeTest.sampleType}</span>}
          </div>

          {/* CTA: keep only one primary CTA in hero (Book Now) */}
          <div className="td-hero-ctas">
            <button className="primary-button" onClick={handleBookNow}>
              {price ? `Book Now ₹${Math.round(price)}` : "Book Now"}
            </button>

            {/* small secondary action opens cart; still present but less prominent */}
            <button
              className="secondary-button"
              onClick={() => navigate("/cart")}
              aria-label="View cart"
              title="View cart"
            >
              View Cart ({totalItems})
            </button>
          </div>

          <div className="td-hero-tags">
            {safeTest.discount && <span className="pill">Save {safeTest.discount}</span>}

            <span className="pill-light">Free Home Collection</span>
            <span className="pill-light">NABL Certified</span>
            {/* taxonomy pills (clickable) */}
            {Array.isArray(safeTest.categories) && safeTest.categories.map(k => (
              <button key={`cat-${k}`} className="pill-link" onClick={() => goToCategory(k)}>#{k}</button>
            ))}
            {Array.isArray(safeTest.organs) && safeTest.organs.map(k => (
              <button key={`org-${k}`} className="pill-link" onClick={() => goToOrgan(k)}>#{k}</button>
            ))}
            {Array.isArray(safeTest.concerns) && safeTest.concerns.map(k => (
              <button key={`con-${k}`} className="pill-link" onClick={() => goToConcern(k)}>#{k}</button>
            ))}
            {Array.isArray(safeTest.seasons) && safeTest.seasons.map(k => (
              <button key={`sea-${k}`} className="pill-link" onClick={() => goToSeason(k)}>#{k}</button>
            ))}

          </div>
        </div>

        <div className="td-hero-right">
          {safeTest.image ? (
            <img src={safeTest.image} alt={safeTest.name} className="hero-image" />
          ) : (
            <div className="hero-image-placeholder" aria-hidden="true">
              {/* simple placeholder */}
              <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect rx="8" width="280" height="160" fill="#fff" stroke="#eee" />
                <g transform="translate(18,18)" fill="#f2f4f6">
                  <rect width="84" height="84" rx="8" />
                </g>
                <g transform="translate(120,20)">
                  <rect width="120" height="12" rx="6" />
                  <rect y="28" width="104" height="10" rx="6" />
                  <rect y="52" width="80" height="10" rx="6" />
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* MAIN GRID: content + sidebar */}
      <div className="test-detail-content" style={{ marginTop: 16 }}>
        <div className="main-column">
          {/* Tabs */}
          <div className="tabs" role="tablist" aria-label="Test sections">
            {["overview", "parameters", "preparation", "results"].map(tab => (
              <button
                key={tab}
                role="tab"
                id={`tab-${tab}`}
                aria-controls={`tabpanel-${tab}`}
                aria-selected={activeTab === tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
                {tab === "parameters" && <span className="tab-count"> {markers.length}</span>}
              </button>
            ))}
          </div>

          {/* Panels */}
          <div className="tab-panels">
            <section id="tabpanel-overview" role="tabpanel" aria-labelledby="tab-overview" tabIndex={-1} className={`tabpanel ${activeTab === "overview" ? "active" : ""}`}>
              <div className="detail-section">
                <h2>About this test</h2>
                <p className="card-description">{details.about || safeTest.description || "No description available."}</p>
              </div>

              <div className="detail-section">
                <h2>Why take this test?</h2>
                {whyTake.length ? (
                  <ul className="why-take-list">
                    {whyTake.map((w, i) => <li key={i}><strong>•</strong> {String(w)}</li>)}
                  </ul>
                ) : (
                  <p>This test helps check important markers recommended by clinicians.</p>
                )}
              </div>
            </section>

            <section id="tabpanel-parameters" role="tabpanel" aria-labelledby="tab-parameters" tabIndex={-1} className={`tabpanel ${activeTab === "parameters" ? "active" : ""}`} ref={paramsRef}>
              <div className="detail-section">
                <h2>Parameters included ({markers.length})</h2>
                <p className="card-description">Key components measured in this test:</p>
                {markers.length ? (
                  <ul className="included-tests-list">
                    {markers.map((m, i) => (
                      <li key={i}><strong>{m.name || m.param || `Marker ${i + 1}`}</strong><div className="info-subtext">{m.info || m.desc || ""}</div></li>
                    ))}
                  </ul>
                ) : <p>No parameter information available.</p>}
              </div>
            </section>

            <section id="tabpanel-preparation" role="tabpanel" aria-labelledby="tab-preparation" tabIndex={-1} className={`tabpanel ${activeTab === "preparation" ? "active" : ""}`}>
              <div className="detail-section">
                <h2>Test Preparation</h2>
                <ul className="preparation-list">
                  {preparationList.map((p, i) => <li key={i}><span role="img" aria-label="Check">✔️</span> {String(p)}</li>)}
                </ul>
              </div>
            </section>

            <section id="tabpanel-results" role="tabpanel" aria-labelledby="tab-results" tabIndex={-1} className={`tabpanel ${activeTab === "results" ? "active" : ""}`} ref={resultsRef}>
              <div className="detail-section">
                <h2>Results & Interpretation</h2>
                <p className="card-description">Typical ranges and units. Always consult a clinician for final interpretation.</p>
                {interpretationTable.length ? (
                  <table className="results-table"><thead><tr><th>Parameter</th><th>Units</th><th>Normal Range</th><th>What it indicates</th></tr></thead>
                    <tbody>
                      {interpretationTable.map((r, i) => (
                        <tr key={i}><td>{r.parameter || r.name || '-'}</td><td>{r.units || r.unit || '-'}</td><td>{r.normalRange || r.range || '-'}</td><td>{r.indicator || r.explain || '-'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p>No interpretation data available.</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar: keep a single Book Now CTA + compact View Cart */}
        <aside className="main-info-card" aria-labelledby="booking-card-heading">
          <div id="booking-card-heading" className="sr-only">Booking summary</div>

          <div className="price-box" role="group" aria-label="Price information">
            <div className="price-info">
              <div className="current-price" aria-live="polite">{price ? `₹${Number(price).toFixed(2)}` : "Contact"}</div>
              {mrpPrice && <div className="mrp-price">MRP: ₹{mrpPrice}</div>}
            </div>
            {bookedCount && <div className="social-proof">⭐ {bookedCount}</div>}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {/* Keep one prominent Book Now here too for conversion flows (hero already has primary CTA) */}
            <button className="primary-button add-to-cart-btn-lg" onClick={handleBookNow}>Book Now</button>
            <button className="secondary-button view-cart-btn" onClick={() => navigate("/cart")}>View Cart ({totalItems})</button>
          </div>

          <div className="promo-offers" aria-live="polite">
            <div className="promo-heading">Offers</div>
            <div className="promo-item"><strong>NEWUSER15</strong><span>Get 15% OFF</span></div>
            {safeTest.discount && <div className="promo-item"><strong>{safeTest.discount}</strong><span>Site Discount</span></div>}
          </div>

          <div className="quick-facts">
            <div className="fact-item"><strong>{safeTest.samples || "Home"}</strong><div className="info-subtext">Sample collection</div></div>
            <div className="fact-item"><strong>{safeTest.reportTime || "6 hours"}</strong><div className="info-subtext">Report time</div></div>
            <div className="fact-item"><strong>{preparationList[0] || "No special prep"}</strong><div className="info-subtext">Preparation</div></div>
            <div className="fact-item"><strong>{safeTest.sampleType || "Blood"}</strong><div className="info-subtext">Sample type</div></div>
          </div>
        </aside>
      </div>
      {/* Related Tests */}
      <div className="detail-section" style={{ marginTop: 28 }}>
        <h2>Related tests</h2>
        <p className="card-description">You might also be interested in these.</p>
        <div className="test-grid compact" style={{ marginTop: 12 }}>
          {MOCK_TESTS
            .filter(t => t.id !== safeTest.id)
            .map(t => {
              const overlap =
                (safeTest.categories || []).some(k => (t.categories || []).includes(k)) ||
                (safeTest.organs || []).some(k => (t.organs || []).includes(k)) ||
                (safeTest.concerns || []).some(k => (t.concerns || []).includes(k)) ||
                (safeTest.seasons || []).some(k => (t.seasons || []).includes(k));
              return overlap ? t : null;
            })
            .filter(Boolean)
            .slice(0, 6)
            .map(t => (
              <TestCard
                key={t.id}
                test={t}
                onAddToCart={() => addItem({ id: t.id, name: t.name, price: t.price || 0 })}
                onDetailsClick={(id) => navigate(`/tests/${t.slug || id}`)}
                variant="compact"
              />
            ))
          }
        </div>
      </div>

    </div>
  );
};

export default TestDetailPage;
