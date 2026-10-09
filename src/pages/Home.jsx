import { Link } from "react-router-dom";
import {
  ArrowRight,
  Recycle,
  Zap,
  Leaf,
  Brain,
  TrendingUp,
} from "lucide-react";

function Home() {
  return (
    <main className="home-page">

      {/* HERO */}

      <section className="hero">

        <div className="hero-content">

          <div className="eyebrow">
            <span className="status-dot"></span>
            AI-POWERED CAMPUS SUSTAINABILITY
          </div>

          <h1>
            Turn campus waste
            <span> into clean energy.</span>
          </h1>

          <p>
            W2E Campus uses AI to understand the waste generated
            across your college and determine the smartest path:
            recycling, biogas, waste-to-energy, or responsible disposal.
          </p>

          <div className="hero-buttons">

            <Link to="/analyzer" className="primary-button">
              Analyze Your Waste
              <ArrowRight size={18} />
            </Link>

            <Link to="/dashboard" className="secondary-button">
              View Campus Impact
            </Link>

          </div>

          <div className="hero-note">
            <Brain size={15} />
            AI analyzes your description — no waste photography required.
          </div>

        </div>

        <div className="energy-card">

          <div className="energy-glow"></div>

          <div className="energy-icon">
            <Zap size={30} />
          </div>

          <span className="energy-label">
            CAMPUS ENERGY POTENTIAL
          </span>

          <div className="energy-number">
            94.2
            <span>kWh</span>
          </div>

          <div className="energy-change">
            <TrendingUp size={14} />
            12.4% this week
          </div>

          <div className="mini-bars">
            <div style={{ height: "35%" }}></div>
            <div style={{ height: "52%" }}></div>
            <div style={{ height: "44%" }}></div>
            <div style={{ height: "68%" }}></div>
            <div style={{ height: "57%" }}></div>
            <div style={{ height: "82%" }}></div>
            <div style={{ height: "72%" }}></div>
          </div>

          <div className="energy-footer">
            Estimated from today's reported waste
          </div>

        </div>

      </section>


      {/* STATS */}

      <section className="quick-stats">

        <div className="quick-stat">
          <div className="stat-icon green">
            <Recycle size={20} />
          </div>

          <div>
            <strong>186 kg</strong>
            <span>Waste processed today</span>
          </div>
        </div>


        <div className="quick-stat">
          <div className="stat-icon orange">
            <Zap size={20} />
          </div>

          <div>
            <strong>94.2 kWh</strong>
            <span>Energy potential</span>
          </div>
        </div>


        <div className="quick-stat">
          <div className="stat-icon leaf">
            <Leaf size={20} />
          </div>

          <div>
            <strong>42.6 kg</strong>
            <span>CO₂e avoided</span>
          </div>
        </div>

      </section>


      {/* FEATURES */}

      <section className="features">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            From waste description
            <br />
            to intelligent action.
          </h2>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-number">01</div>

            <div className="feature-icon">
              ✍️
            </div>

            <h3>Tell us your waste</h3>

            <p>
              Simply describe what you threw away.
              No need to take pictures of waste.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-number">02</div>

            <div className="feature-icon">
              🧠
            </div>

            <h3>AI analyzes it</h3>

            <p>
              Our AI identifies the waste type and
              determines the most suitable processing route.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-number">03</div>

            <div className="feature-icon">
              ⚡
            </div>

            <h3>Recover value</h3>

            <p>
              See potential energy recovery, recycling
              opportunities and environmental impact.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;