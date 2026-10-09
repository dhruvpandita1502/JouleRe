import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Recycle,
  Leaf,
  Trophy,
  Home,
} from "lucide-react";

function Navbar() {
  const location = useLocation();

  const links = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Waste Analyzer",
      path: "/analyzer",
      icon: Recycle,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Impact",
      path: "/impact",
      icon: Leaf,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: Trophy,
    },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon">
          ⚡
        </div>

        <div>
          <div className="logo-title">W2E</div>
          <div className="logo-subtitle">CAMPUS</div>
        </div>
      </Link>

      <div className="nav-links">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${active ? "active" : ""}`}
            >
              <Icon size={17} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="profile">
        <div className="profile-avatar">A</div>

        <div className="profile-info">
          <strong>Ansh</strong>
          <span>Student</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;