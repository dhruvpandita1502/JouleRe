
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Leaf,
  Mic,
  Recycle,
  Send,
  Sparkles,
  Trash2,
  Zap,
  Scale,
} from "lucide-react";
import { analyzeCampusWaste } from "../data/wasteEngine";

const examples = [
  "Leftover rice and vegetables",
  "Plastic bottles and newspaper",
  "Old phone charger",
  "Aluminium cans and glass bottles",
  "Old clothes",
];

const kg = (value) => `${value.toFixed(3)} kg`;

function Metric({ icon: Icon, label, value, note }) {
  return (
    <div className="impact-card">
      <div className="impact-card-icon energy">
        <Icon size={21} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

function Analyzer() {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function runAnalysis() {
    try {
      setError("");
      setResult(analyzeCampusWaste(description, quantity, unit));
    } catch (err) {
      setResult(null);
      setError(err.message);
    }
  }

  const totals = result?.totals;
  const recoveryKg = totals
    ? totals.recyclableKg + totals.reusableKg +
      totals.biogasKg + totals.compostKg + totals.wteKg +
      totals.specialistKg
    : 0;

  return (
    <main className="analyzer-page">
      <section className="analyzer-header">
        <div className="page-header">
          <span>W2E CAMPUS · WASTE AUDIT</span>
          <h1>
            Turn waste into
            <span> useful resources.</span>
          </h1>
          <p>
            Estimate material recovery, energy pathways, landfill
            residuals and opportunities to prevent waste.
          </p>
        </div>
        <div className="analyzer-badge">
          <Brain size={16} />
          Waste optimization
        </div>
      </section>

      <section className="analyzer-layout">
        <div className="analyzer-input-card">
          <div className="input-card-header">
            <div>
              <span className="card-label">WASTE AUDIT INPUT</span>
              <h2>Describe the waste stream</h2>
            </div>
            <Sparkles size={20} />
          </div>

          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setResult(null);
            }}
            placeholder="Example: 2 kg leftover food, plastic bottles and cardboard"
            aria-label="Waste description"
          />

          <div className="quantity-block">
            <label htmlFor="audit-quantity">
              <Scale size={16} />
              Total weight of this waste
            </label>
            <div className="quantity-controls">
              <input
                id="audit-quantity"
                type="number"
                min="0.001"
                max="1000"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                aria-label="Weight unit"
              >
                <option value="kg">kg</option>
                <option value="g">grams</option>
              </select>
            </div>
            <p>
              Mixed waste is split equally across detected categories
              in this prototype. Weighing each material separately
              gives better results.
            </p>
          </div>

          {error && (
            <p className="analyzer-error" role="alert">{error}</p>
          )}

          <button className="analyze-button" onClick={runAnalysis}>
            Analyze Waste Stream
            <Send size={17} />
          </button>

          <div className="quick-section">
            <span className="quick-label">TRY AN EXAMPLE</span>
            <div className="quick-examples">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setDescription(example);
                    setResult(null);
                    setError("");
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="analyzer-info-card">
          <div className="info-icon"><Brain size={23} /></div>
          <h3>Optimization priorities</h3>

          <div className="info-step">
            <div>01</div>
            <span>Prevent waste before it is created.</span>
          </div>
          <div className="info-step">
            <div>02</div>
            <span>Reuse and recover recyclable materials.</span>
          </div>
          <div className="info-step">
            <div>03</div>
            <span>Route suitable organics to biogas or composting.</span>
          </div>
          <div className="info-step">
            <div>04</div>
            <span>Use energy recovery only for suitable accepted residuals.</span>
          </div>
          <div className="info-step">
            <div>05</div>
            <span>Minimize the material sent to landfill.</span>
          </div>

          <div className="info-note">
            <Leaf size={15} />
            <span>
              Facility acceptance rules and contamination must be
              checked before a real waste stream is routed.
            </span>
          </div>
        </aside>
      </section>

      {result && (
        <section className="analysis-result">
          <div className="result-header">
            <div>
              <span className="card-label">WASTE AUDIT RESULTS</span>
              <h2>Recommended resource allocation</h2>
            </div>
            <div className="confidence">Prototype estimate</div>
          </div>

          {result.unknown ? (
            <div className="unknown-result">
              We couldn't classify this material. Add specific
              materials or ask the campus waste team to audit it.
            </div>
          ) : (
            <>
              <div className="result-summary-strip">
                <div>
                  <span>TOTAL WASTE</span>
                  <strong>{kg(result.totalKg)}</strong>
                </div>
                <div>
                  <span>ESTIMATED RECOVERY / SPECIALIST ROUTES</span>
                  <strong>{kg(recoveryKg)}</strong>
                </div>
              </div>

              <div className="impact-results">
                <Metric
                  icon={Recycle}
                  label="RECYCLING"
                  value={kg(totals.recyclableKg)}
                  note="Estimated material recovery"
                />
                <Metric
                  icon={Leaf}
                  label="REUSE"
                  value={kg(totals.reusableKg)}
                  note="Prioritize extending product life"
                />
                <Metric
                  icon={Leaf}
                  label="BIOGAS"
                  value={kg(totals.biogasKg)}
                  note="Organic feedstock estimate"
                />
                <Metric
                  icon={Leaf}
                  label="COMPOSTING"
                  value={kg(totals.compostKg)}
                  note="Suitable organic material"
                />
                <Metric
                  icon={Zap}
                  label="WASTE-TO-ENERGY"
                  value={kg(totals.wteKg)}
                  note={`${totals.energyKwh.toFixed(3)} kWh modelled potential across energy routes`}
                />
                <Metric
                  icon={Brain}
                  label="SPECIALIST HANDLING"
                  value={kg(totals.specialistKg)}
                  note="Use appropriate authorized collection"
                />
                <Metric
                  icon={Trash2}
                  label="LANDFILL RESIDUAL"
                  value={kg(totals.landfillKg)}
                  note="Estimated disposal residual"
                />
              </div>

              <div className="result-header" style={{ marginTop: 30 }}>
                <div>
                  <span className="card-label">MATERIAL BREAKDOWN</span>
                  <h2>Where each category should go</h2>
                </div>
              </div>

              <div className="material-results">
                {result.materials.map((item) => (
                  <article className="material-result-card" key={item.id}>
                    <div className="material-result-icon">
                      {item.id === "organic" ? "🌱" :
                       item.id === "paper" ? "📄" :
                       item.id === "plastic" ? "♻️" :
                       item.id === "metal" ? "🥫" :
                       item.id === "glass" ? "🍾" :
                       item.id === "ewaste" ? "🔋" : "👕"}
                    </div>
                    <div className="material-result-copy">
                      <h3>{item.name} · {kg(item.massKg)}</h3>
                      <p>{item.routeAdvice}</p>
                      <p>
                        Recycle {kg(item.recyclableKg)} ·
                        Reuse {kg(item.reusableKg)} ·
                        Biogas {kg(item.biogasKg)} ·
                        Compost {kg(item.compostKg)} ·
                        WtE {kg(item.wteKg)} ·
                        Landfill {kg(item.landfillKg)}
                        {item.specialistKg > 0
                          ? ` · Specialist ${kg(item.specialistKg)}`
                          : ""}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="result-header" style={{ marginTop: 30 }}>
                <div>
                  <span className="card-label">WASTE MINIMIZATION PLAN</span>
                  <h2>How your campus can reduce waste</h2>
                </div>
              </div>

              <div className="recommendation-list">
                {result.recommendations.map((recommendation, index) => (
                  <div className="recommendation-row" key={recommendation}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{recommendation}</p>
                    <ArrowRight size={16} />
                  </div>
                ))}
              </div>

              <div className="demo-disclaimer">
                <strong>IMPORTANT: PROTOTYPE MODE</strong>
                <p>
                  Allocation fractions and energy yields are illustrative
                  settings, not verified facility performance. Energy is
                  modelled potential, not measured electricity. Specialist
                  waste is shown separately from landfill. Validate all
                  fractions, yields and facility acceptance rules before
                  using this for real decisions.
                </p>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default Analyzer;
