
import { useMemo, useState } from "react";
import {
  Trophy,
  Medal,
  Leaf,
  Recycle,
  Zap,
  Users,
  TrendingUp,
  Crown,
  Sprout,
  Target,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import "../index.css";

const DEMO_PLAYERS = [
  { id: 1, name: "Aarav Sharma", team: "Eco Warriors", points: 1280, recycled: 42.5, streak: 12 },
  { id: 2, name: "Priya Verma", team: "Green DTU", points: 1140, recycled: 38.2, streak: 9 },
  { id: 3, name: "Kabir Singh", team: "Eco Warriors", points: 1025, recycled: 31.8, streak: 7 },
  { id: 4, name: "Ananya Gupta", team: "Green DTU", points: 920, recycled: 28.4, streak: 6 },
  { id: 5, name: "Rohan Mehta", team: "Campus Cleaners", points: 810, recycled: 25.1, streak: 5 },
  { id: 6, name: "Ishita Rao", team: "Eco Warriors", points: 735, recycled: 21.7, streak: 4 },
  { id: 7, name: "Dev Malhotra", team: "Green DTU", points: 640, recycled: 18.6, streak: 4 },
  { id: 8, name: "Meera Kapoor", team: "Campus Cleaners", points: 525, recycled: 15.2, streak: 3 },
];

const DEMO_TEAMS = [
  { id: 1, name: "Eco Warriors", members: 42, points: 8420, recycled: 186.4 },
  { id: 2, name: "Green DTU", members: 36, points: 7190, recycled: 154.8 },
  { id: 3, name: "Campus Cleaners", members: 29, points: 5860, recycled: 121.3 },
  { id: 4, name: "Planet Protectors", members: 24, points: 4730, recycled: 98.6 },
];

const TIME_OPTIONS = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "All time", value: "all" },
];

function getLocalImpactPoints() {
  try {
    const entries = JSON.parse(
      localStorage.getItem("w2e-campus-my-impact-v1") || "[]"
    );

    if (!Array.isArray(entries)) return 0;

    return entries.reduce((total, entry) => {
      const weight = Number(entry.weight) || 0;
      const route = String(entry.route || "").toLowerCase();

      // Demo scoring rules. Replace with validated server-side scoring later.
      let multiplier = 10;

      if (route.includes("reuse") || route.includes("prevention")) {
        multiplier = 15;
      } else if (route.includes("compost") || route.includes("biogas")) {
        multiplier = 12;
      } else if (route.includes("recycl")) {
        multiplier = 10;
      }

      return total + Math.round(weight * multiplier);
    }, 0);
  } catch {
    return 0;
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Leaderboard() {
  const [category, setCategory] = useState("students");
  const [period, setPeriod] = useState("week");
  const [search, setSearch] = useState("");
  const [myName, setMyName] = useState(
    () => localStorage.getItem("w2e-campus-display-name") || "You"
  );
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(myName);

  const localPoints = getLocalImpactPoints();

  const players = useMemo(() => {
    // Period-based values are illustrative until real dated activity records
    // and server-side rankings are connected.
    const multiplier = period === "week" ? 1 : period === "month" ? 2.4 : 4;

    const list = DEMO_PLAYERS.map((player) => ({
      ...player,
      points: Math.round(player.points * multiplier),
    }));

    list.push({
      id: "you",
      name: myName,
      team: "Your activities",
      points: localPoints,
      recycled: 0,
      streak: 0,
      isYou: true,
    });

    return list.sort((a, b) => b.points - a.points);
  }, [period, myName, localPoints]);

  const teams = useMemo(() => {
    const multiplier = period === "week" ? 1 : period === "month" ? 2.4 : 4;

    return DEMO_TEAMS.map((team) => ({
      ...team,
      points: Math.round(team.points * multiplier),
    })).sort((a, b) => b.points - a.points);
  }, [period]);

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.team}`.toLowerCase().includes(search.toLowerCase())
  );

  const myRank = players.findIndex((player) => player.isYou) + 1;
  const displayedPlayers = filteredPlayers;
  const topThree = players.slice(0, 3);

  function saveName(event) {
    event.preventDefault();

    const cleaned = nameInput.trim();
    if (!cleaned) return;

    setMyName(cleaned);
    localStorage.setItem("w2e-campus-display-name", cleaned);
    setEditingName(false);
  }

  return (
    <main className="leaderboard-page">
      <section className="leaderboard-hero">
        <div className="leaderboard-hero-copy">
          <div className="leaderboard-eyebrow">
            <Trophy size={15} />
            W2E CAMPUS COMMUNITY
          </div>

          <h1>
            Small actions.
            <br />
            <span>Big impact.</span>
          </h1>

          <p>
            Celebrate the people and teams making DTU a cleaner, more
            sustainable campus.
          </p>

          <div className="leaderboard-hero-stats">
            <div>
              <Users size={17} />
              <span>
                <strong>135+</strong>
                <small>Demo participants</small>
              </span>
            </div>
            <div>
              <Leaf size={17} />
              <span>
                <strong>561 kg</strong>
                <small>Illustrative recovery</small>
              </span>
            </div>
          </div>
        </div>

        <div className="leaderboard-trophy-art" aria-hidden="true">
          <div className="trophy-glow" />
          <div className="trophy-orbit trophy-orbit-one" />
          <div className="trophy-orbit trophy-orbit-two" />
          <div className="trophy-icon-wrap">
            <Trophy size={78} strokeWidth={1.4} />
          </div>
          <div className="floating-leaf floating-leaf-one">
            <Leaf size={24} />
          </div>
          <div className="floating-leaf floating-leaf-two">
            <Sprout size={27} />
          </div>
          <div className="floating-star"><Crown size={20} /></div>
        </div>
      </section>

      <section className="leaderboard-personal-card">
        <div className="personal-avatar">
          <Leaf size={24} />
        </div>

        <div className="personal-copy">
          <span className="personal-kicker">YOUR GREEN JOURNEY</span>
          <h2>{myName}</h2>
          <p>
            {localPoints > 0
              ? `${localPoints.toLocaleString()} points from your logged activities`
              : "Log an activity in My Impact to start earning demo points."}
          </p>
        </div>

        <div className="personal-rank">
          <span>Current demo rank</span>
          <strong>#{myRank}</strong>
        </div>

        <button
          type="button"
          className="leaderboard-edit-button"
          onClick={() => {
            setNameInput(myName);
            setEditingName((value) => !value);
          }}
        >
          Edit profile
        </button>
      </section>

      {editingName && (
        <form className="leaderboard-name-form" onSubmit={saveName}>
          <label htmlFor="leaderboard-name">Display name</label>
          <input
            id="leaderboard-name"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            maxLength={40}
            placeholder="Enter your display name"
          />
          <button type="submit">Save name</button>
        </form>
      )}

      <section className="leaderboard-controls">
        <div className="leaderboard-tabs" role="tablist" aria-label="Ranking category">
          <button
            type="button"
            role="tab"
            aria-selected={category === "students"}
            className={category === "students" ? "active" : ""}
            onClick={() => setCategory("students")}
          >
            <Users size={16} />
            Individuals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={category === "teams"}
            className={category === "teams" ? "active" : ""}
            onClick={() => setCategory("teams")}
          >
            <ShieldCheck size={16} />
            Teams
          </button>
        </div>

        <div className="leaderboard-period-control">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={period === option.value ? "active" : ""}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {category === "students" ? (
        <>
          <section className="leaderboard-podium">
            {topThree.map((player, index) => (
              <article
                key={player.id}
                className={`podium-card podium-place-${index + 1} ${
                  player.isYou ? "podium-you" : ""
                }`}
              >
                <div className={`podium-medal medal-${index + 1}`}>
                  {index === 0 ? (
                    <Crown size={24} />
                  ) : (
                    <Medal size={23} />
                  )}
                </div>

                <div className={`podium-avatar avatar-${index + 1}`}>
                  {getInitials(player.name)}
                </div>

                <h3>{player.name}</h3>
                <p>{player.team}</p>

                <div className="podium-points">
                  {player.points.toLocaleString()}
                  <span> pts</span>
                </div>

                <div className="podium-rank">#{index + 1}</div>
              </article>
            ))}
          </section>

          <section className="leaderboard-list-panel">
            <div className="leaderboard-list-heading">
              <div>
                <h2>Campus rankings</h2>
                <p>Every action counts towards a greener campus.</p>
              </div>

              <label className="leaderboard-search">
                <span className="sr-only">Search participants</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search participants..."
                />
              </label>
            </div>

            <div className="leaderboard-table">
              <div className="leaderboard-table-head">
                <span>Rank</span>
                <span>Participant</span>
                <span>Material recovered</span>
                <span>Green points</span>
              </div>

              {displayedPlayers.map((player) => {
                const rank = players.findIndex((item) => item.id === player.id) + 1;

                return (
                  <div
                    className={`leaderboard-table-row ${
                      player.isYou ? "leaderboard-row-you" : ""
                    }`}
                    key={player.id}
                  >
                    <div className="leaderboard-rank-number">
                      {rank <= 3 ? (
                        <Medal
                          size={19}
                          className={`rank-medal rank-medal-${rank}`}
                        />
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    <div className="leaderboard-participant">
                      <div className="participant-avatar">
                        {getInitials(player.name)}
                      </div>
                      <div>
                        <strong>
                          {player.name}
                          {player.isYou && <span className="you-badge">YOU</span>}
                        </strong>
                        <small>{player.team}</small>
                      </div>
                    </div>

                    <div className="leaderboard-recovered">
                      {player.isYou
                        ? "—"
                        : `${(player.recycled * (period === "week" ? 1 : period === "month" ? 2.4 : 4)).toFixed(1)} kg`}
                    </div>

                    <div className="leaderboard-points">
                      {player.points.toLocaleString()}
                      <span> pts</span>
                    </div>
                  </div>
                );
              })}

              {displayedPlayers.length === 0 && (
                <div className="leaderboard-empty">
                  No participants match your search.
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="leaderboard-list-panel team-ranking-panel">
          <div className="leaderboard-list-heading">
            <div>
              <h2>Team rankings</h2>
              <p>Which community is leading the sustainability drive?</p>
            </div>
          </div>

          <div className="leaderboard-table">
            <div className="leaderboard-table-head team-table-head">
              <span>Rank</span>
              <span>Campus team</span>
              <span>Members</span>
              <span>Green points</span>
            </div>

            {teams.map((team, index) => (
              <div className="leaderboard-table-row team-table-row" key={team.id}>
                <div className="leaderboard-rank-number">
                  {index < 3 ? (
                    <Medal
                      size={19}
                      className={`rank-medal rank-medal-${index + 1}`}
                    />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>

                <div className="leaderboard-participant">
                  <div className="participant-avatar team-avatar">
                    <Sprout size={19} />
                  </div>
                  <div>
                    <strong>{team.name}</strong>
                    <small>{team.recycled.toFixed(1)} kg recovered · demo</small>
                  </div>
                </div>

                <div className="leaderboard-recovered">{team.members}</div>
                <div className="leaderboard-points">
                  {team.points.toLocaleString()}
                  <span> pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="leaderboard-bottom-grid">
        <article className="leaderboard-challenge-card">
          <div className="challenge-icon">
            <Target size={23} />
          </div>
          <span className="challenge-label">CAMPUS CHALLENGE</span>
          <h2>Make every gram count.</h2>
          <p>
            Log your next recycling, reuse, or composting activity to grow your
            impact score.
          </p>
          <a href="/my-impact">
            Log an activity <ArrowUpRight size={16} />
          </a>
        </article>

        <article className="leaderboard-rules-card">
          <h2>How Green Points work</h2>
          <div className="points-rule">
            <span className="points-rule-icon">
              <Recycle size={18} />
            </span>
            <div>
              <strong>Recycle responsibly</strong>
              <p>Log material routed to an appropriate recycling stream.</p>
            </div>
            <span>10 pts/kg*</span>
          </div>
          <div className="points-rule">
            <span className="points-rule-icon">
              <Leaf size={18} />
            </span>
            <div>
              <strong>Reuse and prevent</strong>
              <p>Prioritize reuse and avoiding waste in the first place.</p>
            </div>
            <span>15 pts/kg*</span>
          </div>
          <div className="points-rule">
            <span className="points-rule-icon">
              <Zap size={18} />
            </span>
            <div>
              <strong>Compost or biogas</strong>
              <p>Record suitable organic waste sent to an available facility.</p>
            </div>
            <span>12 pts/kg*</span>
          </div>
          <p className="leaderboard-rule-note">
            *Illustrative demo scoring only. Real points require validated
            activity records and server-side rules.
          </p>
        </article>
      </section>

      <footer className="leaderboard-demo-note">
        <TrendingUp size={16} />
        Demo leaderboard · Sample participants and team totals are not official
        DTU data. Your points are calculated locally from My Impact entries.
      </footer>
    </main>
  );
}
