import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">METRO-R76</div>

          <div className="brand-subtitle">Legal Metrology</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/instruments">Instruments</NavLink>

          <NavLink to="/test-reports">Test Reports</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-label">SYSTEM STATUS</div>

          <div className="system-status">
            <span className="status-dot" />
            System Online
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-title">METRO-R76 Testing System</div>

          <div className="topbar-user">Laboratory User</div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
