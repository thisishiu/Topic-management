import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>TopicFlow</h1>
        <p className="subtitle">Graduation Topic Workspace</p>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/topics">Topics</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/approvals">Approvals</NavLink>
          <NavLink to="/forms">Forms</NavLink>
          <NavLink to="/uploads">Uploads</NavLink>
          <NavLink to="/committees">Committees</NavLink>
        </nav>
        <div className="user-box">
          <strong>{user?.fullName}</strong>
          <small>{user?.role}</small>
          <button onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
