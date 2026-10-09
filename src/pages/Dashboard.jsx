
import { useMemo, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Recycle,
  Leaf,
  Zap,
  Trash2,
  TrendingUp,
  CalendarDays,
  ExternalLink,
  LocateFixed,
} from "lucide-react";

// Approximate DTU campus center. Zone coordinates below are demo points.
const DTU_CENTER = [28.7504, 77.1177];

const DEMO_ZONES = [
  {
    id: "canteen",
    name: "Canteen Zone",
    lat: 28.7511,
    lng: 77.1185,
    dailyKg: 38,
    recyclablePct: 15,
    organicPct: 65,
    energyPct: 12,
    landfillPct: 8,
    status: "High waste",
    source: "Demo estimate",
  },
  {
    id: "academic",
    name: "Academic Zone",
    lat: 28.7507,
    lng: 77.1168,
    dailyKg: 22,
    recyclablePct: 48,
    organicPct: 18,
    energyPct: 20,
    landfillPct: 14,
    status: "Moderate waste",
    source: "Demo estimate",
  },
  {
    id: "hostel",
    name: "Hostel Zone",
    lat: 28.7489,
    lng: 77.1184,
    dailyKg: 31,
    recyclablePct: 25,
    organicPct: 45,
    energyPct: 18,
    landfillPct: 12,
    status: "High waste",
    source: "Demo estimate",
  },
  {
    id: "library",
    name: "Library Zone",
    lat: 28.7512,
    lng: 77.1160,
    dailyKg: 12,
    recyclablePct: 55,
    organicPct: 12,
    energyPct: 18,
    landfillPct: 15,
    status: "Low waste",
    source: "Demo estimate",
  },
  {
    id: "sports",
    name: "Sports Zone",
    lat: 28.7495,
    lng: 77.1162,
    dailyKg: 17,
    recyclablePct: 30,
    organicPct: 25,
    energyPct: 25,
    landfillPct: 20,
    status: "Moderate waste",
    source: "Demo estimate",
  },
];

const PERIODS = [
  { label: "Today", value: 1 },
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
];

function formatKg(value) {
  return `${value.toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  })} kg`;
}

function wasteColor(kg) {
  if (kg >= 30) return "#ff6868";
  if (kg >= 20) return "#ffb454";
  if (kg >= 12) return "#f3dc69";
  return "#65d995";
}


function ZoomToZone({ zone }) {
  const map = useMap();

  useEffect(() => {
    if (!zone) return;

    map.flyTo([zone.lat, zone.lng], 18, {
      duration: 0.7,
    });
  }, [map, zone]);

  return null;
}


function Dashboard() {
  const [period, setPeriod] = useState(1);
  const [selectedZoneId, setSelectedZoneId] = useState("canteen");

  const zones = useMemo(
    () =>
      DEMO_ZONES.map((zone) => ({
        ...zone,
        wasteKg: zone.dailyKg * period,
      })),
    [period]
  );

  const selectedZone =
    zones.find((zone) => zone.id === selectedZoneId) || zones[0];

  const totalWaste = zones.reduce(
    (sum, zone) => sum + zone.wasteKg,
    0
  );

  const highWasteZone = [...zones].sort(
    (a, b) => b.wasteKg - a.wasteKg
  )[0];

  const estimatedBreakdown = (zone) => ({
    recyclable: zone.wasteKg * zone.recyclablePct / 100,
    organic: zone.wasteKg * zone.organicPct / 100,
    energy: zone.wasteKg * zone.energyPct / 100,
    landfill: zone.wasteKg * zone.landfillPct / 100,
  });

  const selectedBreakdown = estimatedBreakdown(selectedZone);

  return (
    <main className="page-container campus-dashboard">
      <div className="page-header">
        <span>DTU · CAMPUS WASTE INTELLIGENCE</span>
        <h1>Know your campus. Reduce your waste.</h1>
        <p>
          Explore area-wise waste generation, identify hotspots,
          and understand where prevention and recovery efforts
          could have the greatest impact.
        </p>
      </div>

      <div className="waste-demo-banner">
        <MapPin size={17} />
        <span>
          DEMO DATA — waste quantities and zone coordinates are
          illustrative, not actual DTU measurements.
        </span>
      </div>

      <div className="waste-period-bar">
        <div className="waste-period-label">
          <CalendarDays size={17} />
          <span>Reporting period</span>
        </div>

        <div className="waste-period-options">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              className={period === item.value ? "selected" : ""}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="waste-kpi-grid">
        <article className="waste-kpi">
          <div className="waste-kpi-icon green">
            <Trash2 size={20} />
          </div>
          <span>TOTAL REPORTED WASTE</span>
          <strong>{formatKg(totalWaste)}</strong>
          <small>Across {zones.length} demo zones</small>
        </article>

        <article className="waste-kpi">
          <div className="waste-kpi-icon orange">
            <TrendingUp size={20} />
          </div>
          <span>HIGHEST WASTE ZONE</span>
          <strong>{formatKg(highWasteZone.wasteKg)}</strong>
          <small>{highWasteZone.name}</small>
        </article>

        <article className="waste-kpi">
          <div className="waste-kpi-icon leaf">
            <Recycle size={20} />
          </div>
          <span>POTENTIAL RECYCLABLE</span>
          <strong>
            {formatKg(
              zones.reduce(
                (sum, zone) =>
                  sum + zone.wasteKg * zone.recyclablePct / 100,
                0
              )
            )}
          </strong>
          <small>Illustrative material estimate</small>
        </article>
      </section>

      <section className="dtu-map-workspace">
        <div className="dtu-map-panel">
          <div className="dtu-map-heading">
            <div>
              <span className="card-label">LIVE MAP VIEW</span>
              <h2>DTU waste hotspots</h2>
              <p>Select a circle to inspect an area.</p>
            </div>

            <a
              className="map-external-link"
              href="https://www.openstreetmap.org/?mlat=28.7504&mlon=77.1177#map=17/28.7504/77.1177"
              target="_blank"
              rel="noreferrer"
              aria-label="Open DTU in OpenStreetMap"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="dtu-heatmap">
            <MapContainer
              center={DTU_CENTER}
              zoom={17}
              minZoom={15}
              maxZoom={19}
              maxBounds={[
                [28.742, 77.105],
                [28.759, 77.131],
              ]}
              maxBoundsViscosity={0.8}
              scrollWheelZoom
              zoomControl={false}
              className="dtu-leaflet-map"
            >
              <ZoomControl position="bottomright" />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <ZoomToZone zone={selectedZone} />

              {zones.map((zone) => {
                const radius = Math.max(
                  10,
                  Math.min(27, 8 + Math.sqrt(zone.wasteKg) * 1.7)
                );

                return (
                  <CircleMarker
                    key={zone.id}
                    center={[zone.lat, zone.lng]}
                    radius={radius}
                    pathOptions={{
                      color:
                        selectedZoneId === zone.id
                          ? "#ffffff"
                          : wasteColor(zone.wasteKg),
                      weight: selectedZoneId === zone.id ? 3 : 2,
                      fillColor: wasteColor(zone.wasteKg),
                      fillOpacity: 0.78,
                    }}
                    eventHandlers={{
                      click: () => setSelectedZoneId(zone.id),
                    }}
                  >
                    <Popup>
                      <div className="dtu-map-popup">
                        <strong>{zone.name}</strong>
                        <h3>{formatKg(zone.wasteKg)}</h3>
                        <p>{zone.status}</p>
                        <p>Estimated for {period} day(s)</p>
                        <p>Demo data — verify location and weight.</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div className="dtu-heat-legend">
            <span>Lower waste</span>
            <i className="legend-low"></i>
            <i className="legend-mid"></i>
            <i className="legend-high"></i>
            <span>Higher waste</span>
          </div>
        </div>

        <aside className="dtu-zone-sidebar">
          <div className="dtu-sidebar-heading">
            <span className="card-label">AREA INSPECTOR</span>
            <h2>{selectedZone.name}</h2>
            <strong className="dtu-selected-weight">
              {formatKg(selectedZone.wasteKg)}
            </strong>
            <span className="dtu-selected-caption">
              Estimated waste in selected period
            </span>
          </div>

          <div className="dtu-breakdown">
            <div className="dtu-breakdown-row">
              <div className="dtu-breakdown-label">
                <Recycle size={16} />
                Recyclable
              </div>
              <strong>{formatKg(selectedBreakdown.recyclable)}</strong>
              <div className="dtu-progress">
                <div
                  style={{
                    width: `${selectedZone.recyclablePct}%`,
                    background: "#65d995",
                  }}
                />
              </div>
            </div>

            <div className="dtu-breakdown-row">
              <div className="dtu-breakdown-label">
                <Leaf size={16} />
                Organic
              </div>
              <strong>{formatKg(selectedBreakdown.organic)}</strong>
              <div className="dtu-progress">
                <div
                  style={{
                    width: `${selectedZone.organicPct}%`,
                    background: "#91d879",
                  }}
                />
              </div>
            </div>

            <div className="dtu-breakdown-row">
              <div className="dtu-breakdown-label">
                <Zap size={16} />
                Energy route
              </div>
              <strong>{formatKg(selectedBreakdown.energy)}</strong>
              <div className="dtu-progress">
                <div
                  style={{
                    width: `${selectedZone.energyPct}%`,
                    background: "#ffbd61",
                  }}
                />
              </div>
            </div>

            <div className="dtu-breakdown-row">
              <div className="dtu-breakdown-label">
                <Trash2 size={16} />
                Landfill residual
              </div>
              <strong>{formatKg(selectedBreakdown.landfill)}</strong>
              <div className="dtu-progress">
                <div
                  style={{
                    width: `${selectedZone.landfillPct}%`,
                    background: "#f17b7b",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="dtu-zone-advice">
            <Leaf size={17} />
            <div>
              <strong>Suggested next action</strong>
              <p>
                {selectedZone.organicPct >= 40
                  ? "Audit food waste and improve source separation for composting or biogas."
                  : selectedZone.recyclablePct >= 40
                    ? "Check bin contamination and improve recycling collection."
                    : "Conduct a waste audit to identify the best reduction opportunity."}
              </p>
            </div>
          </div>

          <div className="dtu-data-note">
            <LocateFixed size={15} />
            <span>
              Zone location and waste composition are demo values.
              Replace them with verified campus data.
            </span>
          </div>
        </aside>
      </section>

      <section className="dtu-zone-ranking">
        <div className="dtu-ranking-heading">
          <div>
            <span className="card-label">HOTSPOT RANKING</span>
            <h2>Waste by campus area</h2>
          </div>
          <span className="dtu-ranking-period">
            {period === 1 ? "Today" : `Last ${period} days`}
          </span>
        </div>

        {[...zones]
          .sort((a, b) => b.wasteKg - a.wasteKg)
          .map((zone, index) => (
            <button
              key={zone.id}
              className={`dtu-ranking-row ${
                selectedZoneId === zone.id ? "active" : ""
              }`}
              onClick={() => setSelectedZoneId(zone.id)}
            >
              <span className="dtu-ranking-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="dtu-ranking-name">{zone.name}</span>
              <span className="dtu-ranking-bar">
                <span
                  style={{
                    width: `${zone.wasteKg / Math.max(...zones.map((z) => z.wasteKg)) * 100}%`,
                    background: wasteColor(zone.wasteKg),
                  }}
                />
              </span>
              <strong>{formatKg(zone.wasteKg)}</strong>
            </button>
          ))}
      </section>

      <p className="dtu-dashboard-disclaimer">
        All waste quantities, material percentages, zone positions and
        recommendations on this page are illustrative demo data. Actual
        campus waste quantities require weighed collection records or
        a campus waste audit. The map markers are not verified building
        locations or official DTU boundaries.
      </p>
    </main>
  );
}

export default Dashboard;
