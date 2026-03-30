import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="stack">
      <Card
        title={`Welcome, ${user?.fullName || "Guest"}`}
        subtitle="This dashboard is tailored for multi-role topic workflows."
      >
        <p>
          Use the side navigation to register topics, track milestones, review approvals, upload revisions, and manage committee
          assignments.
        </p>
      </Card>
    </div>
  );
};
