import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Camera,
  ImagePlus,
  Leaf,
  Recycle,
  Scale,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  analyzeCampusWaste,
  detectWasteMaterialTypes,
} from "../data/wasteEngine";

const examples = [
  "Plastic bottles and newspaper, leftover rice",
  "Leftover rice and vegetables, paper",
  "Plastic bottles and newspaper",
  "Old phone charger",
  "Aluminium cans and glass bottles",
  "Old clothes",
];

const kg = (value) => `${(Number(value) || 0).toFixed(3)} kg`;

function Metric({ icon: Icon, label, value, note }) {
  return (
    <article className="impact-card analyzer-metric">
      <div className="impact-card-icon energy">
        <Icon size={20} />
      </div>
      <div className="analyzer-metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

export default function Analyzer() {
  const resultsRef = useRef(null);
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("kg");
  const [photo, setPhoto] = useState(null);
  const [materialWeights, setMaterialWeights] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [photoEstimate, setPhotoEstimate] = useState(null);
  const [isEstimatingPhoto, setIsEstimatingPhoto] = useState(false);

  const detectedMaterials = detectWasteMaterialTypes(description);
  const enteredWeightTotal = detectedMaterials.reduce(
    (sum, material) => sum + (Number(materialWeights[material.id]) || 0),
    0
  );
  const targetWeight = enteredWeightTotal;
  const tolerance = Math.max(0.001, targetWeight * 0.001);
  const weightsMatch =
    detectedMaterials.length > 0 &&
    detectedMaterials.every(
      (material) =>
        materialWeights[material.id] !== "" &&
        materialWeights[material.id] !== undefined &&
        Number.isFinite(Number(materialWeights[material.id])) &&
        Number(materialWeights[material.id]) > 0
    ) &&
    Math.abs(enteredWeightTotal - targetWeight) <= tolerance;

  useEffect(() => {
    if (!result) return;
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [result]);

  useEffect(() => {
    return () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  function updateDescription(value) {
    setDescription(value);
    setMaterialWeights({});
    setResult(null);
    setError("");
  }

  function selectPhoto(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }

    setPhoto({
      file,
      url: URL.createObjectURL(file),
      name: file.name || "Waste photo",
    });
    setResult(null);
    setPhotoEstimate(null);
    setError("");
  }

  function removePhoto() {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setPhotoEstimate(null);
    setMaterialWeights({});
    if (cameraRef.current) cameraRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
  }

  async function estimatePhotoWeight() {
    if (!photo?.file) {
      setError("Take or upload a waste photo first.");
      return;
    }
    setIsEstimatingPhoto(true);
    setError("");
    setPhotoEstimate(null);
    try {
      const formData = new FormData();
      formData.append("image", photo.file);
      const response = await fetch("/api/estimate-weight", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Photo estimation failed.");
      if (!Array.isArray(data.materials) || !data.materials.length) throw new Error("AI could not identify enough waste in this image. Try a clearer photo.");
      const validMaterials = data.materials.filter((item) => item.id && Number(item.estimatedKg) > 0);
      if (!validMaterials.length) throw new Error("The photo did not produce a usable weight estimate.");
      const canonicalLabels = { organic: "food scraps", paper: "paper and cardboard", plastic: "plastic bottles", metal: "metal cans", glass: "glass bottles", ewaste: "e-waste electronics", textile: "old clothes", residual: "mixed residual waste" };
      const labels = validMaterials.map((item) => canonicalLabels[item.id] || item.label || item.id);
      setDescription(labels.join(", "));
      setUnit("kg");
      setMaterialWeights(Object.fromEntries(validMaterials.map((item) => [item.id, String(Number(item.estimatedKg.toFixed ? item.estimatedKg.toFixed(3) : item.estimatedKg))])));
      setPhotoEstimate(data);
      setResult(null);
    } catch (err) {
      setError(err?.message || "Could not estimate weight from the photo. Check that the backend is running.");
    } finally {
      setIsEstimatingPhoto(false);
    }
  }

  function runAnalysis() {
    setError("");
    setResult(null);

    if (!description.trim()) {
      setError(
        photo
          ? "Use “Estimate weight with AI” on your photo, or describe the waste manually."
          : "Please describe the waste before analysing it."
      );
      return;
    }

    if (detectedMaterials.length === 0) {
      setError("No supported material was detected from the description. Try adding a supported material name.");
      return;
    }

    const amount = enteredWeightTotal;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
      setError("Enter a positive weight for the detected material(s). Total weight must not exceed 1,000.");
      return;
    }

    if (detectedMaterials.length > 0) {
      const missingWeight = detectedMaterials.some((material) => {
        const value = materialWeights[material.id];
        return (
          value === "" ||
          value === undefined ||
          !Number.isFinite(Number(value)) ||
          Number(value) <= 0
        );
      });

      if (missingWeight) {
        setError("Enter a positive weight for every detected material.");
        return;
      }

    }

    try {
      const weights = detectedMaterials.map((material) => ({
        id: material.id,
        weight: Number(materialWeights[material.id]),
      }));

      setResult(analyzeCampusWaste(description, String(amount), unit, weights));
    } catch (err) {
      setError(err?.message || "Unable to analyse this waste stream.");
    }
  }

  const totals = result?.totals;
  const recoveryKg = totals
    ? (totals.recyclableKg || 0) +
      (totals.reusableKg || 0) +
      (totals.biogasKg || 0) +
      (totals.compostKg || 0) +
      (totals.wteKg || 0) +
      (totals.specialistKg || 0)
    : 0;

  return (
    <main className="analyzer-page analyzer-redesign">
      <section className="analyzer-header">
        <div className="page-header">
          <span className="analyzer-eyebrow">
            <span className="eyebrow-dot" />
            W2E CAMPUS · WASTE AUDIT
          </span>
          <h1>
            Turn waste into <span>useful resources.</span>
          </h1>
          <p>
            Upload a waste photo for an approximate AI weight range, then review recovery pathways.
          </p>
        </div>
        <div className="analyzer-badge">
          <Brain size={16} />
          Smart waste audit
        </div>
      </section>

      <section className="analyzer-layout">
        <div className="analyzer-input-card analyzer-main-card">
          <div className="input-card-header">
            <div>
              <span className="card-label">STEP 01 · WASTE DETAILS</span>
              <h2>What are you throwing away?</h2>
              <p className="analyzer-card-subtitle">
                Upload any waste photo and let AI estimate the materials and approximate weight.
              </p>
            </div>
            <div className="analyzer-heading-icon">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="photo-action-grid">
            <button
              type="button"
              className="photo-action-button"
              onClick={() => cameraRef.current?.click()}
            >
              <span className="photo-button-icon"><Camera size={19} /></span>
              <span><strong>Take a photo</strong><small>Use your camera</small></span>
            </button>
            <button
              type="button"
              className="photo-action-button secondary"
              onClick={() => uploadRef.current?.click()}
            >
              <span className="photo-button-icon"><ImagePlus size={19} /></span>
              <span><strong>Upload image</strong><small>Choose from device</small></span>
            </button>

            <input
              ref={cameraRef}
              className="visually-hidden-file-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => selectPhoto(event.target.files?.[0])}
              aria-label="Take a photo of waste"
            />
            <input
              ref={uploadRef}
              className="visually-hidden-file-input"
              type="file"
              accept="image/*"
              onChange={(event) => selectPhoto(event.target.files?.[0])}
              aria-label="Upload a waste photo"
            />
          </div>

          {photo && (
            <div className="waste-photo-preview">
              <img src={photo.url} alt="Selected waste" />
              <div className="waste-photo-caption">
                <span><CheckCircle2 size={15} /> {photo.name}</span>
                <button type="button" onClick={removePhoto} aria-label="Remove photo">
                  <X size={17} />
                </button>
              </div>
              <p>
                Photo attached. Run AI weight estimation to prefill the material list.
              </p>
            </div>
          )}

          <label className="analyzer-field-label" htmlFor="waste-description">
            Waste description
          </label>
          <textarea
            id="waste-description"
            className="analyzer-description"
            value={description}
            onChange={(event) => updateDescription(event.target.value)}
            placeholder="e.g. plastic bottles, newspaper and leftover rice"
            aria-label="Waste description"
          />

          {photo && (
            <div className="an-photo-estimate-actions">
              <button type="button" className="analyze-button" onClick={estimatePhotoWeight} disabled={isEstimatingPhoto}>
                <Sparkles size={17} /> {isEstimatingPhoto ? "Estimating from photo…" : "Estimate weight with AI"}
              </button>
              <p>AI estimates visible waste quantity and approximate weight. Results may be inaccurate without a known size reference.</p>
            </div>
          )}
          {photoEstimate && (
            <div className="an-photo-estimate-result" role="status">
              <strong>AI estimated {Number(photoEstimate.estimatedWeightKg || 0).toFixed(2)} kg</strong>
              <span>Likely range: {Number(photoEstimate.minWeightKg || 0).toFixed(2)}–{Number(photoEstimate.maxWeightKg || 0).toFixed(2)} kg · Confidence: {photoEstimate.confidence || "low"}</span>
              <small>Approximation only — review the detected materials and edit their weights before analysing.</small>
            </div>
          )}

          {detectedMaterials.length > 0 && (
            <section className="material-weight-editor">
              <div className="weight-editor-header">
                <div className="weight-editor-icon"><Scale size={19} /></div>
                <div>
                  <h3>Break down the total weight</h3>
                  <p>Enter the weight of each detected material. The total is calculated automatically.</p>
                </div>
              </div>

              <div className="material-weight-list">
                {detectedMaterials.map((material, index) => (
                  <div
                    className="material-weight-row"
                    key={material.id}
                    style={{ "--row-index": index }}
                  >
                    <label htmlFor={`weight-${material.id}`}>
                      <span className="material-weight-dot" />
                      <span>{material.name}</span>
                    </label>
                    <div className="material-weight-input-wrap">
                      <input
                        id={`weight-${material.id}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={materialWeights[material.id] ?? ""}
                        onChange={(event) => {
                          setMaterialWeights((previous) => ({
                            ...previous,
                            [material.id]: event.target.value,
                          }));
                          setResult(null);
                          setError("");
                        }}
                      />
                      <span>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`weight-total-status ${weightsMatch ? "is-valid" : ""}`}>
                <div>
                  {weightsMatch ? <CheckCircle2 size={17} /> : <Scale size={17} />}
                  <span>Weight assigned</span>
                </div>
                <strong>
                  {enteredWeightTotal.toFixed(3)} <small>{unit} total</small>
                </strong>
                <div className="weight-progress-track">
                  <div
                    className="weight-progress-fill"
                    style={{
                      width: `${detectedMaterials.length
                        ? (detectedMaterials.filter((material) => Number(materialWeights[material.id]) > 0).length / detectedMaterials.length) * 100
                        : 0}%`,
                    }}
                  />
                </div>
                <p>
                  {weightsMatch
                    ? "Total weight is calculated from your material entries."
                    : "Enter a positive weight for every detected material."}
                </p>
              </div>
            </section>
          )}

          {error && (
            <div className="analyzer-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button className="analyze-button analyzer-submit" onClick={runAnalysis}>
            <span>Analyze waste stream</span>
            <span className="analyze-button-icon"><Send size={17} /></span>
          </button>

          <div className="quick-section">
            <span className="quick-label">NEED AN EXAMPLE?</span>
            <div className="quick-examples">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => updateDescription(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="analyzer-info-card analyzer-priority-card">
          <div className="info-icon"><Brain size={23} /></div>
          <span className="card-label">OUR APPROACH</span>
          <h3>Waste hierarchy</h3>
          <p className="priority-intro">
            The best waste is the waste we never create. Prioritize options in this order.
          </p>
          {[
            ["01", "Prevent", "Reduce waste at the source."],
            ["02", "Reuse & recycle", "Keep useful materials in circulation."],
            ["03", "Compost & biogas", "Process suitable organic waste."],
            ["04", "Energy recovery", "Only for accepted residual materials."],
            ["05", "Final disposal", "Minimize unavoidable landfill."],
          ].map(([number, title, text]) => (
            <div className="priority-item" key={number}>
              <div className="priority-number">{number}</div>
              <div><strong>{title}</strong><span>{text}</span></div>
            </div>
          ))}
          <div className="info-note">
            <Leaf size={16} />
            <span>Always confirm local facility acceptance and contamination rules.</span>
          </div>
        </aside>
      </section>

      {result && (
        <section
          ref={resultsRef}
          id="analysis-results"
          className="analysis-result analyzer-results-enter"
          aria-live="polite"
        >
          <div className="result-header">
            <div>
              <span className="card-label">STEP 02 · YOUR RESULTS</span>
              <h2>Recommended resource allocation</h2>
            </div>
            <div className="confidence">Prototype estimate</div>
          </div>

          {result.unknown ? (
            <div className="unknown-result">
              This material was not classified by the current rules. Describe its
              composition more specifically or audit it manually.
            </div>
          ) : (
            <>
              <div className="result-summary-strip">
                <div><span>TOTAL WASTE</span><strong>{kg(result.totalKg)}</strong></div>
                <div><span>RECOVERY / SPECIALIST ROUTES</span><strong>{kg(recoveryKg)}</strong></div>
              </div>

              <div className="impact-results">
                <Metric icon={Recycle} label="RECYCLING" value={kg(totals.recyclableKg)} note="Estimated material recovery" />
                <Metric icon={Leaf} label="REUSE" value={kg(totals.reusableKg)} note="Extend product life" />
                <Metric icon={Leaf} label="BIOGAS" value={kg(totals.biogasKg)} note="Potential organic feedstock" />
                <Metric icon={Leaf} label="COMPOSTING" value={kg(totals.compostKg)} note="Suitable organic material" />
                <Metric icon={Zap} label="WASTE-TO-ENERGY" value={kg(totals.wteKg)} note={`${(Number(totals.energyKwh) || 0).toFixed(3)} kWh modelled potential`} />
                <Metric icon={Brain} label="SPECIALIST HANDLING" value={kg(totals.specialistKg)} note="Authorized collection" />
                <Metric icon={Trash2} label="LANDFILL RESIDUAL" value={kg(totals.landfillKg)} note="Estimated disposal residual" />
              </div>

              <div className="result-header analyzer-breakdown-heading">
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
                        item.id === "ewaste" ? "🔋" : "♻️"}
                    </div>
                    <div className="material-result-copy">
                      <h3>{item.name} · {kg(item.massKg)}</h3>
                      <p>{item.routeAdvice}</p>
                      <p>
                        Recycle {kg(item.recyclableKg)} · Reuse {kg(item.reusableKg)} ·
                        Biogas {kg(item.biogasKg)} · Compost {kg(item.compostKg)} ·
                        WtE {kg(item.wteKg)} · Landfill {kg(item.landfillKg)}
                        {item.specialistKg > 0 ? ` · Specialist ${kg(item.specialistKg)}` : ""}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="result-header analyzer-breakdown-heading">
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
                  Allocation fractions and energy yields are illustrative, not
                  verified facility performance. Modelled energy is not measured
                  electricity. Validate settings and facility rules before real use.
                </p>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
