import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AppLayout } from "./layouts/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TopicsPage } from "./pages/TopicsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { FormsPage } from "./pages/FormsPage";
import { UploadsPage } from "./pages/UploadsPage";
import { CommitteesPage } from "./pages/CommitteesPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Restoring your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="topics" element={<TopicsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="uploads" element={<UploadsPage />} />
        <Route path="committees" element={<CommitteesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
