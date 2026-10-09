
import { useMemo, useState } from "react";
import {
  Leaf,
  Recycle,
  Zap,
  Trash2,
  Trophy,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Target,
  X,
  Sprout,
  ChevronDown,
} from "lucide-react";

const STORAGE_KEY = "w2e-campus-my-impact-v1";

function daysAgo(days, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const SAMPLE_ENTRIES = [
  {
    id: "sample-1",
    description: "Separated plastic water bottles",
    material: "Plastic",
    weight: 0.4,
    route: "Recycling",
    points: 8,
    date: daysAgo(0, 10),
    demo: true,
  },
  {
    id: "sample-2",
    description: "Canteen food scraps",
    material: "Organic",
    weight: 0.7,
    route: "Biogas / composting",
    points: 10,
    date: daysAgo(1, 13),
    demo: true,
  },
  {
    id: "sample-3",
    description: "Old notebooks and paper",
    material: "Paper",
    weight: 0.5,
    route: "Recycling",
    points: 8,
    date: daysAgo(2, 11),
    demo: true,
  },
  {
    id: "sample-4",
    description: "Reusable bottle instead of disposable cups",
    material: "Waste prevention",
    weight: 0.1,
    route: "Waste prevented",
    points: 12,
    date: daysAgo(4, 9),
    demo: true,
  },
  {
    id: "sample-5",
    description: "Sorted metal cans",
    material: "Metal",
    weight: 0.3,
    route: "Recycling",
    points: 8,
    date: daysAgo(10, 14),
    demo: true,
  },
  {
    id: "sample-6",
    description: "Sorted food waste",
    material: "Organic",
    weight: 0.8,
    route: "Biogas / composting",
    points: 10,
    date: daysAgo(18, 12),
    demo: true,
  },
];

const MATERIALS = [
  "Organic",
  "Paper",
  "Plastic",
  "Metal",
  "Glass",
  "E-waste",
  "Textile",
  "Other",
];

const ROUTES = [
  "Recycling",
  "Reuse",
  "Biogas / composting",
  "Waste-to-energy",
  "Responsible disposal",
  "Waste prevented",
];

const POINTS_BY_ROUTE = {
  Recycling: 8,
  Reuse: 10,
  "Biogas / composting": 10,
  "Waste-to-energy": 3,
  "Responsible disposal": 2,
  "Waste prevented": 12,
};

const PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "All time", value: "all" },
];

function loadEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to the demo records if browser storage is unavailable.
  }

  return SAMPLE_ENTRIES;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getLevel(points) {
  if (points >= 250) {
    return { name: "Planet Protector", next: null, minimum: 250 };
  }

  if (points >= 100) {
    return { name: "Eco Champion", next: 250, minimum: 100 };
  }

  if (points >= 40) {
    return { name: "Green Guardian", next: 100, minimum: 40 };
  }

  return { name: "Eco Starter", next: 40, minimum: 0 };
}

function Impact() {
  const [entries, setEntries] = useState(loadEntries);
  const [period, setPeriod] = useState("30");
  const [showForm, setShowForm] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("Organic");
  const [weight, setWeight] = useState("0.5");
  const [route, setRoute] = useState("Biogas / composting");

  const filteredEntries = useMemo(() => {
    if (period === "all") return entries;

    const cutoff = Date.now() - Number(period) * 24 * 60 * 60 * 1000;

    return entries.filter(
      (entry) => new Date(entry.date).getTime() >= cutoff
    );
  }, [entries, period]);

  const metrics = useMemo(() => {
    return filteredEntries.reduce(
      (total, entry) => {
        total.weight += Number(entry.weight) || 0;
        total.points += Number(entry.points) || 0;

        if (entry.route === "Recycling") {
          total.recycled += Number(entry.weight) || 0;
        }

        if (
          entry.route === "Reuse" ||
          entry.route === "Waste prevented"
        ) {
          total.diverted += Number(entry.weight) || 0;
        }

        if (
          entry.route === "Biogas / composting" ||
          entry.route === "Waste-to-energy"
        ) {
          total.energyRoute += Number(entry.weight) || 0;
        }

        return total;
      },
      { weight: 0, recycled: 0, diverted: 0, energyRoute: 0, points: 0 }
    );
  }, [filteredEntries]);

  const totalPoints = entries.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );

  const level = getLevel(totalPoints);
  const progress = level.next
    ? Math.min(
        100,
        ((totalPoints - level.minimum) / (level.next - level.minimum)) * 100
      )
    : 100;

  const historyToShow = showAllHistory
    ? filteredEntries
    : filteredEntries.slice(0, 5);

  const weeklyActivity = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const weightForDay = entries
        .filter((entry) => {
          const timestamp = new Date(entry.date).getTime();
          return timestamp >= day.getTime() && timestamp < nextDay.getTime();
        })
        .reduce((sum, entry) => sum + (Number(entry.weight) || 0), 0);

      days.push({
        label: day.toLocaleDateString("en-IN", { weekday: "short" }),
        weight: weightForDay,
      });
    }

    return days;
  }, [entries]);

  const maxDailyWeight = Math.max(
    ...weeklyActivity.map((day) => day.weight),
    1
  );

  const materialBreakdown = useMemo(() => {
    return MATERIALS.map((name) => ({
      name,
      weight: filteredEntries
        .filter((entry) => entry.material === name)
        .reduce((sum, entry) => sum + (Number(entry.weight) || 0), 0),
    }))
      .filter((item) => item.weight > 0)
      .sort((a, b) => b.weight - a.weight);
  }, [filteredEntries]);

  function persistEntries(nextEntries) {
    setEntries(nextEntries);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    } catch {
      setNotice("Changes are active for this session but could not be saved in browser storage.");
    }
  }

  function submitEntry(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const numericWeight = Number(weight);

    if (!description.trim()) {
      setFormError("Enter a description for this entry.");
      return;
    }

    if (
      !Number.isFinite(numericWeight) ||
      numericWeight <= 0 ||
      numericWeight > 1000
    ) {
      setFormError("Enter a weight greater than 0 and no more than 1,000 kg.");
      return;
    }

    const newEntry = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
      description: description.trim(),
      material,
      weight: numericWeight,
      route,
      points: POINTS_BY_ROUTE[route],
      date: new Date().toISOString(),
      demo: false,
    };

    persistEntries([newEntry, ...entries]);
    setPeriod("30");
    setDescription("");
    setWeight("0.5");
    setShowForm(false);
    setNotice("Impact entry added successfully.");
  }

  function deleteEntry(id) {
    const nextEntries = entries.filter((entry) => entry.id !== id);
    persistEntries(nextEntries);
    setNotice("Entry removed.");
  }

  function resetDemo() {
    persistEntries(SAMPLE_ENTRIES);
    setPeriod("30");
    setNotice("Demo history restored.");
  }

  return (
    <main className="page-container impact-page">
      <div className="impact-heading">
        <div className="page-header">
          <span>W2E CAMPUS · MY IMPACT</span>
          <h1>Your actions add up.</h1>
          <p>
            Track your waste contributions, discover your habits,
            and find opportunities to make your campus greener.
          </p>
        </div>

        <button
          className="impact-add-button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError("");
          }}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? "Close form" : "Log an activity"}
        </button>
      </div>

      <div className="impact-demo-banner">
        <Leaf size={17} />
        <span>
          Your profile starts with example activity. New entries are saved
          in this browser only until we connect AWS.
        </span>
      </div>

      {notice && (
        <div className="impact-notice" role="status">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {showForm && (
        <section className="impact-form-card">
          <div className="impact-section-heading">
            <div>
              <span className="card-label">NEW ACTIVITY</span>
              <h2>Record your contribution</h2>
            </div>
          </div>

          <form onSubmit={submitEntry}>
            <div className="impact-form-grid">
              <div className="impact-field impact-field-wide">
                <label htmlFor="impact-description">
                  What did you do?
                </label>
                <input
                  id="impact-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. Separated bottles after lunch"
                  maxLength={200}
                />
              </div>

              <div className="impact-field">
                <label htmlFor="impact-material">Material</label>
                <select
                  id="impact-material"
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                >
                  {MATERIALS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="impact-field">
                <label htmlFor="impact-weight">Weight (kg)</label>
                <input
                  id="impact-weight"
                  type="number"
                  min="0.001"
                  max="1000"
                  step="any"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                />
              </div>

              <div className="impact-field impact-field-wide">
                <label htmlFor="impact-route">Action / route</label>
                <select
                  id="impact-route"
                  value={route}
                  onChange={(event) => setRoute(event.target.value)}
                >
                  {ROUTES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="impact-points-preview">
              <Trophy size={17} />
              <span>
                This activity earns <strong>{POINTS_BY_ROUTE[route]} Green Points</strong> in the demo.
              </span>
            </div>

            {formError && (
              <p className="analyzer-error" role="alert">{formError}</p>
            )}

            <div className="impact-form-actions">
              <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="primary-button" type="submit">
                <Plus size={16} />
                Save activity
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="impact-level-card">
        <div className="impact-level-main">
          <div className="impact-level-icon">
            <Sprout size={30} />
          </div>
          <div>
            <span className="card-label">YOUR GREEN STATUS</span>
            <h2>{level.name}</h2>
            <p>
              {level.next
                ? `${level.next - totalPoints} more points to reach the next level`
                : "You've reached the highest demo level!"}
            </p>
          </div>
        </div>

        <div className="impact-level-progress">
          <div className="impact-progress-label">
            <span>{totalPoints} Green Points</span>
            <span>{level.next ? `${level.next} points` : "MAX LEVEL"}</span>
          </div>
          <div className="impact-progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
          <div className="impact-level-footnote">
            Points are demonstration rewards, not verified environmental savings.
          </div>
        </div>
      </section>

      <div className="impact-period-toolbar">
        <div>
          <span className="card-label">PERSONAL ANALYTICS</span>
          <h2>Your impact overview</h2>
        </div>

        <div className="impact-period-tabs">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              className={period === item.value ? "active" : ""}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="impact-metric-grid">
        <article className="impact-metric-card">
          <div className="impact-metric-top">
            <div className="impact-metric-icon green"><Recycle size={20} /></div>
            <ArrowUpRight size={17} className="impact-metric-arrow" />
          </div>
          <span>WASTE LOGGED</span>
          <strong>{metrics.weight.toFixed(2)} <small>kg</small></strong>
          <p>Total weight in selected period</p>
        </article>

        <article className="impact-metric-card">
          <div className="impact-metric-top">
            <div className="impact-metric-icon mint"><CheckCircle2 size={20} /></div>
            <ArrowUpRight size={17} className="impact-metric-arrow" />
          </div>
          <span>RECYCLED</span>
          <strong>{metrics.recycled.toFixed(2)} <small>kg</small></strong>
          <p>Entries marked for recycling</p>
        </article>

        <article className="impact-metric-card">
          <div className="impact-metric-top">
            <div className="impact-metric-icon orange"><Zap size={20} /></div>
            <ArrowUpRight size={17} className="impact-metric-arrow" />
          </div>
          <span>ENERGY ROUTE</span>
          <strong>{metrics.energyRoute.toFixed(2)} <small>kg</small></strong>
          <p>Material assigned to an energy route</p>
        </article>

        <article className="impact-metric-card">
          <div className="impact-metric-top">
            <div className="impact-metric-icon leaf"><Leaf size={20} /></div>
            <ArrowUpRight size={17} className="impact-metric-arrow" />
          </div>
          <span>REUSE / PREVENTION</span>
          <strong>{metrics.diverted.toFixed(2)} <small>kg</small></strong>
          <p>Entries marked reused or prevented</p>
        </article>
      </section>

      <section className="impact-analytics-grid">
        <article className="impact-panel">
          <div className="impact-panel-heading">
            <div>
              <span className="card-label">YOUR ACTIVITY</span>
              <h2>Waste logged this week</h2>
            </div>
            <CalendarDays size={19} />
          </div>

          <div className="impact-chart">
            {weeklyActivity.map((day) => (
              <div className="impact-chart-column" key={day.label}>
                <span className="impact-chart-value">
                  {day.weight > 0 ? day.weight.toFixed(1) : ""}
                </span>
                <div className="impact-chart-track">
                  <div
                    className="impact-chart-bar"
                    style={{
                      height: `${day.weight > 0 ? Math.max(8, day.weight / maxDailyWeight * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="impact-chart-day">{day.label}</span>
              </div>
            ))}
          </div>

          <div className="impact-chart-footer">
            <TrendingUp size={15} />
            <span>Log activities regularly to build your history.</span>
          </div>
        </article>

        <article className="impact-panel">
          <div className="impact-panel-heading">
            <div>
              <span className="card-label">MATERIAL MIX</span>
              <h2>What you log</h2>
            </div>
            <Recycle size={19} />
          </div>

          {materialBreakdown.length === 0 ? (
            <p className="impact-empty">
              No activity in this period. Add an entry to see your breakdown.
            </p>
          ) : (
            <div className="impact-material-list">
              {materialBreakdown.map((item, index) => {
                const percentage = metrics.weight
                  ? Math.min(100, item.weight / metrics.weight * 100)
                  : 0;

                return (
                  <div className="impact-material-row" key={item.name}>
                    <div className="impact-material-label">
                      <span className={`impact-material-dot dot-${index % 5}`} />
                      <span>{item.name}</span>
                      <strong>{item.weight.toFixed(2)} kg</strong>
                    </div>
                    <div className="impact-material-track">
                      <div style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="impact-panel-footnote">
            Based on your logged entries, not measured campus-wide totals.
          </div>
        </article>
      </section>

      <section className="impact-history-panel">
        <div className="impact-panel-heading">
          <div>
            <span className="card-label">ACTIVITY HISTORY</span>
            <h2>Your recent contributions</h2>
          </div>

          <span className="impact-history-count">
            {filteredEntries.length} entries
          </span>
        </div>

        {historyToShow.length === 0 ? (
          <div className="impact-empty">
            <Leaf size={25} />
            <p>No entries for this period. Log an activity to get started.</p>
          </div>
        ) : (
          <div className="impact-history-list">
            {historyToShow.map((entry) => (
              <article className="impact-history-item" key={entry.id}>
                <div className="impact-history-icon">
                  {entry.material === "Organic" ? "🌱" :
                   entry.material === "Paper" ? "📄" :
                   entry.material === "Plastic" ? "♻️" :
                   entry.material === "Metal" ? "🥫" :
                   entry.material === "Glass" ? "🍾" :
                   entry.material === "E-waste" ? "🔋" :
                   entry.material === "Waste prevention" ? "🌍" : "👕"}
                </div>

                <div className="impact-history-description">
                  <strong>{entry.description}</strong>
                  <span>
                    {entry.material} · {entry.route} · {formatDate(entry.date)}
                    {entry.demo ? " · Sample" : ""}
                  </span>
                </div>

                <div className="impact-history-values">
                  <strong>{Number(entry.weight).toFixed(2)} kg</strong>
                  <span>+{entry.points} pts</span>
                </div>

                {!entry.demo && (
                  <button
                    className="impact-delete-button"
                    title="Delete entry"
                    aria-label={`Delete ${entry.description}`}
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </article>
            ))}
          </div>
        )}

        {filteredEntries.length > 5 && (
          <button
            className="impact-view-all"
            onClick={() => setShowAllHistory((value) => !value)}
          >
            {showAllHistory ? "Show less" : "View all activities"}
            <ChevronDown
              size={16}
              style={{
                transform: showAllHistory ? "rotate(180deg)" : "none",
              }}
            />
          </button>
        )}
      </section>

      <section className="impact-goal-card">
        <div className="impact-goal-icon"><Target size={24} /></div>
        <div className="impact-goal-copy">
          <span className="card-label">YOUR NEXT STEP</span>
          <h2>Small habits. Measurable progress.</h2>
          <p>
            Keep logging activities and look for ways to prevent waste
            before it needs recycling or disposal.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setShowForm(true);
            setFormError("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Log an activity <Plus size={16} />
        </button>
      </section>

      <div className="impact-bottom-actions">
        <button className="impact-reset-button" onClick={resetDemo}>
          Restore demo history
        </button>
        <span>
          Local prototype · Activity is stored in this browser only
        </span>
      </div>
    </main>
  );
}

export default Impact;
