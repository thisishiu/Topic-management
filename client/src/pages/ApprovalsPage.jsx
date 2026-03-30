import { useEffect, useMemo, useState } from "react";
import { approvalsApi } from "../api/workflow";
import { topicsApi } from "../api/topics";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";

const DecisionButtons = ({ onApprove, onReject }) => (
  <div className="action-row">
    <button type="button" onClick={onApprove}>
      Approve
    </button>
    <button type="button" className="ghost" onClick={onReject}>
      Reject
    </button>
  </div>
);

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [timeline, setTimeline] = useState({ lecturer: [], department: [] });
  const [note, setNote] = useState("");
  const [suggestedPanel, setSuggestedPanel] = useState("");
  const [error, setError] = useState("");

  const isLecturer = user?.role === "LECTURER";
  const isDepartment = user?.role === "DEPARTMENT_HEAD" || user?.role === "ADMIN";

  const loadPending = async () => {
    try {
      if (isLecturer) {
        const { data } = await approvalsApi.pendingLecturer();
        setPending(data);
      } else if (isDepartment) {
        const { data } = await approvalsApi.pendingDepartment();
        setPending(data);
      } else {
        setPending([]);
      }
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load pending approvals");
    }
  };

  const loadTopics = async () => {
    const { data } = await topicsApi.list();
    setTopics(data);
    if (!selectedTopicId && data[0]) {
      setSelectedTopicId(data[0].id);
    }
  };

  const loadTimeline = async (topicId) => {
    if (!topicId) {
      setTimeline({ lecturer: [], department: [] });
      return;
    }
    const { data } = await approvalsApi.byTopic(topicId);
    setTimeline(data);
  };

  useEffect(() => {
    loadPending();
    loadTopics();
  }, [user?.role]);

  useEffect(() => {
    loadTimeline(selectedTopicId);
  }, [selectedTopicId]);

  const submitLecturer = async (topicId, status) => {
    await approvalsApi.decideLecturer(topicId, { status, note });
    setNote("");
    await loadPending();
    await loadTimeline(topicId);
  };

  const submitDepartment = async (topicId, status) => {
    await approvalsApi.decideDepartment(topicId, {
      status,
      note,
      suggestedPanel: suggestedPanel
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setNote("");
    setSuggestedPanel("");
    await loadPending();
    await loadTimeline(topicId);
  };

  const pendingCards = useMemo(() => {
    if (!pending.length) {
      return <p>No pending approvals for your role.</p>;
    }

    if (isLecturer) {
      return pending.map((approval) => (
        <Card key={approval.id} title={approval.topic.title} subtitle={`Submitted by ${approval.topic.createdBy.fullName}`}>
          <p>{approval.topic.description}</p>
          <p>Fields: {approval.topic.fields.join(", ")}</p>
          <p>Members: {approval.topic.members.map((member) => member.student.fullName).join(", ")}</p>
          <DecisionButtons
            onApprove={() => submitLecturer(approval.topic.id, "APPROVED")}
            onReject={() => submitLecturer(approval.topic.id, "REJECTED")}
          />
        </Card>
      ));
    }

    return pending.map((topic) => (
      <Card key={topic.id} title={topic.title} subtitle={`Supervisor: ${topic.supervisor?.fullName || "Unassigned"}`}>
        <p>{topic.description}</p>
        <DecisionButtons
          onApprove={() => submitDepartment(topic.id, "APPROVED")}
          onReject={() => submitDepartment(topic.id, "REJECTED")}
        />
      </Card>
    ));
  }, [pending, isLecturer, note, suggestedPanel]);

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <Card title="Pending Approval Queue" subtitle="Approve or reject proposals with notification emails">
        <div className="form">
          <textarea
            rows={3}
            placeholder="Decision note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {isDepartment ? (
            <input
              placeholder="Suggested panel names (comma separated)"
              value={suggestedPanel}
              onChange={(event) => setSuggestedPanel(event.target.value)}
            />
          ) : null}
        </div>
        <div className="stack-sm">{pendingCards}</div>
      </Card>

      <Card title="Approval Timeline" subtitle="View lecturer and department decisions by topic">
        <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)}>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
        <div className="split-grid">
          <div>
            <h3>Lecturer Decisions</h3>
            <ul className="timeline">
              {timeline.lecturer.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.lecturer.fullName}</strong>
                  <p>{entry.status}</p>
                  <small>{entry.note || "No note"}</small>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Department Decisions</h3>
            <ul className="timeline">
              {timeline.department.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.reviewer.fullName}</strong>
                  <p>{entry.status}</p>
                  <small>{entry.note || "No note"}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
