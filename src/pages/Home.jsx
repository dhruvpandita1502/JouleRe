
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Recycle,
  Zap,
  Leaf,
  BarChart3,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
  Wind,
  Sprout,
  ShieldCheck,
  Activity,
} from "lucide-react";
import "../index.css";

const slides = [
  {
    eyebrow: "SMART WASTE ANALYSIS",
    title: "Know your waste.",
    highlight: "Unlock its value.",
    description:
      "Describe your campus waste and discover responsible routes for recycling, reuse, composting, and suitable waste-to-energy recovery.",
    icon: Recycle,
    tag: "AI-ASSISTED ANALYSIS",
    accent: "green",
    metric: "4+",
    metricLabel: "waste pathways",
    steps: [
      { icon: Trash2, label: "Describe", value: "Waste input" },
      { icon: Recycle, label: "Classify", value: "Material type" },
      { icon: Leaf, label: "Optimize", value: "Recovery route" },
    ],
  },
  {
    eyebrow: "CIRCULAR CAMPUS",
    title: "Waste less.",
    highlight: "Recover more.",
    description:
      "Prioritize prevention, reuse, and recycling before selecting composting or eligible residual waste recovery.",
    icon: Leaf,
    tag: "CIRCULAR ECONOMY",
    accent: "orange",
    metric: "1st",
    metricLabel: "prevent waste",
    steps: [
      { icon: ShieldCheck, label: "Prevent", value: "Avoid waste" },
      { icon: Recycle, label: "Recover", value: "Reuse & recycle" },
      { icon: Sprout, label: "Restore", value: "Organic recovery" },
    ],
  },
  {
    eyebrow: "MEASURE YOUR IMPACT",
    title: "Every action",
    highlight: "moves us forward.",
    description:
      "Track your logged sustainability activities, build better habits, and see how your contribution grows over time.",
    icon: Zap,
    tag: "CAMPUS IMPACT",
    accent: "green",
    metric: "100%",
    metricLabel: "your actions count",
    steps: [
      { icon: Activity, label: "Log", value: "Your activity" },
      { icon: BarChart3, label: "Measure", value: "Your impact" },
      { icon: Trophy, label: "Celebrate", value: "Your progress" },
    ],
  },
];

const quickLinks = [
  {
    number: "01",
    icon: Recycle,
    title: "Waste Analyzer",
    description:
      "Describe waste, identify material types, and explore suitable recovery routes.",
    link: "/analyzer",
    label: "Analyze waste",
    color: "green",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Campus Dashboard",
    description:
      "Explore illustrative campus waste hotspots, material breakdowns, and trends.",
    link: "/dashboard",
    label: "Explore dashboard",
    color: "orange",
  },
  {
    number: "03",
    icon: Leaf,
    title: "My Impact",
    description:
      "Log your sustainability activities and follow your personal progress.",
    link: "/impact",
    label: "Track my impact",
    color: "green",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Leaderboard",
    description:
      "Compare demo Green Points and discover the campus sustainability challenge.",
    link: "/leaderboard",
    label: "View rankings",
    color: "orange",
  },
];

const processSteps = [
  {
    icon: Trash2,
    title: "Describe",
    text: "Enter your waste details in plain language.",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "Understand",
    text: "Classify the material and evaluate possible routes.",
    number: "02",
  },
  {
    icon: Recycle,
    title: "Recover",
    text: "Prioritize reuse, recycling, and suitable recovery.",
    number: "03",
  },
  {
    icon: BarChart3,
    title: "Measure",
    text: "Record activities and monitor progress.",
    number: "04",
  },
];

function useAnimatedNumber(target, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [paused, setPaused] = useState(false);

  const slide = slides[activeSlide];
  const SlideIcon = slide.icon;

  const demoActivities = useAnimatedNumber(128);
  const demoRoutes = useAnimatedNumber(4);
  const demoCategories = useAnimatedNumber(5);

  useEffect(() => {
    if (!autoRotate || paused) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [autoRotate, paused]);

  function changeSlide(direction) {
    setActiveSlide(
      (current) => (current + direction + slides.length) % slides.length
    );
  }

  return (
    <main className="home-page">
      {/* HERO */}
      <section
        className={`home-hero home-hero-${slide.accent}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="home-hero-grid" />
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />

        <div className="home-hero-content" key={activeSlide}>
          <div className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            {slide.eyebrow}
          </div>

          <h1 className="home-hero-title">
            {slide.title}
            <br />
            <span>{slide.highlight}</span>
          </h1>

          <p className="home-hero-description">{slide.description}</p>

          <div className="home-hero-actions">
            <Link to="/analyzer" className="home-primary-button">
              <Sparkles size={17} />
              Analyze your waste
              <ArrowRight size={17} />
            </Link>

            <Link to="/dashboard" className="home-secondary-button">
              Explore campus
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="home-trust-line">
            <ShieldCheck size={15} />
            <span>Smarter decisions. Responsible recovery.</span>
          </div>
        </div>

        {/* INTERACTIVE VISUAL PANEL */}
        <div className="home-visual-panel" key={`visual-${activeSlide}`}>
          <div className="home-visual-top">
            <div>
              <span className="home-panel-overline">W2E INTELLIGENCE</span>
              <h3>From waste to value</h3>
            </div>
            <span className="home-live-badge">
              <span />
              DEMO
            </span>
          </div>

          <div className={`home-feature-icon home-feature-icon-${slide.accent}`}>
            <SlideIcon size={33} />
          </div>

          <div className="home-slide-metric">
            <strong>{slide.metric}</strong>
            <span>{slide.metricLabel}</span>
          </div>

          <div className="home-process-visual">
            {slide.steps.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <div className="home-process-item" key={step.label}>
                  <div className="home-process-icon">
                    <StepIcon size={19} />
                  </div>
                  <div className="home-process-copy">
                    <strong>{step.label}</strong>
                    <span>{step.value}</span>
                  </div>
                  {index < slide.steps.length - 1 && (
                    <ArrowRight className="home-process-arrow" size={16} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="home-carousel-footer">
            <div className="home-carousel-dots">
              {slides.map((item, index) => (
                <button
                  key={item.eyebrow}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                  className={index === activeSlide ? "active" : ""}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>

            <div className="home-carousel-controls">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => changeSlide(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => changeSlide(1)}
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                aria-label={autoRotate ? "Pause carousel" : "Play carousel"}
                onClick={() => setAutoRotate((value) => !value)}
              >
                {autoRotate ? <Activity size={16} /> : <RotateCw size={16} />}
              </button>
            </div>
          </div>

          <div className="home-visual-tag">{slide.tag}</div>
        </div>

        <div className="home-hero-bottom-label">
          <span>W2E CAMPUS</span>
          <span>BUILDING A CIRCULAR CAMPUS</span>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats-strip" aria-label="Platform highlights">
        <div className="home-stats-intro">
          <span className="home-section-kicker">THE PLATFORM</span>
          <h2>One campus. A smarter waste cycle.</h2>
        </div>

        <div className="home-stat">
          <div className="home-stat-icon green">
            <Activity size={19} />
          </div>
          <div>
            <strong>{demoActivities}+</strong>
            <span>Sample activities</span>
          </div>
        </div>

        <div className="home-stat">
          <div className="home-stat-icon orange">
            <Recycle size={19} />
          </div>
          <div>
            <strong>{demoRoutes}+</strong>
            <span>Recovery pathways</span>
          </div>
        </div>

        <div className="home-stat">
          <div className="home-stat-icon green">
            <Leaf size={19} />
          </div>
          <div>
            <strong>{demoCategories}</strong>
            <span>Material categories</span>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="home-explore-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">EXPLORE W2E</span>
            <h2>Your campus, in action.</h2>
            <p>Choose where you want to start.</p>
          </div>
          <span className="home-section-index">01 / EXPLORE</span>
        </div>

        <div className="home-quick-grid">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                to={item.link}
                className={`home-quick-card home-quick-card-${item.color}`}
                key={item.title}
                style={{ "--card-index": index }}
              >
                <div className="home-quick-card-top">
                  <span className="home-quick-icon">
                    <Icon size={22} />
                  </span>
                  <span className="home-quick-number">{item.number}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="home-quick-link">
                  {item.label}
                  <ArrowUpRight size={17} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-process-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">HOW IT WORKS</span>
            <h2>From description to action.</h2>
            <p>A clear process for making better waste decisions.</p>
          </div>
          <span className="home-section-index">02 / THE PROCESS</span>
        </div>

        <div className="home-process-grid">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article className="home-step-card" key={step.number}>
                <div className="home-step-top">
                  <span className="home-step-number">{step.number}</span>
                  <span className="home-step-icon">
                    <Icon size={21} />
                  </span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.text}</p>

                {index < processSteps.length - 1 && (
                  <ArrowRight className="home-step-arrow" size={18} />
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="home-bottom-cta">
        <div className="home-cta-orb home-cta-orb-one" />
        <div className="home-cta-orb home-cta-orb-two" />

        <div className="home-cta-icon">
          <Wind size={27} />
        </div>

        <div className="home-cta-copy">
          <span className="home-section-kicker">YOUR NEXT ACTION STARTS HERE</span>
          <h2>Ready to rethink campus waste?</h2>
          <p>Start with a simple description. Find a smarter way forward.</p>
        </div>

        <Link to="/analyzer" className="home-primary-button home-cta-button">
          Get started
          <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="home-footer">
        <div>
          <Leaf size={16} />
          <strong>W2E CAMPUS</strong>
        </div>
        <span>Designing a more circular campus, one action at a time.</span>
      </footer>

      <p className="home-data-disclaimer">
        Demonstration interface: sample activity counts and illustrative
        indicators are not verified campus measurements.
      </p>
    </main>
  );
}