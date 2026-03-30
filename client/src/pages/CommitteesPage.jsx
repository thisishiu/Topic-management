import { useEffect, useMemo, useState } from "react";
import { topicsApi, usersApi } from "../api/topics";
import { committeesApi } from "../api/workflow";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";

export const CommitteesPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === "DEPARTMENT_HEAD" || user?.role === "ADMIN";

  const [topics, setTopics] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [rows, setRows] = useState([{ lecturerId: "", role: "Supervisor" }]);
  const [error, setError] = useState("");

  const loadInitial = async () => {
    const [topicsRes, lecturersRes] = await Promise.all([topicsApi.list(), usersApi.list("LECTURER")]);
    setTopics(topicsRes.data);
    setLecturers(lecturersRes.data);
    if (!selectedTopicId && topicsRes.data[0]) {
      setSelectedTopicId(topicsRes.data[0].id);
    }
  };

  const loadAssignments = async (topicId) => {
    if (!topicId) {
      setAssignments([]);
      return;
    }
    const { data } = await committeesApi.list(topicId);
    setAssignments(data);
  };

  useEffect(() => {
    loadInitial().catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load committee data"));
  }, []);

  useEffect(() => {
    loadAssignments(selectedTopicId).catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load assignments"));
  }, [selectedTopicId]);

  const addRow = () => {
    setRows((prev) => [...prev, { lecturerId: "", role: "Reviewer" }]);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = rows.filter((row) => row.lecturerId && row.role.trim());
    if (!payload.length) {
      setError("Please add at least one valid committee row");
      return;
    }

    await committeesApi.set(selectedTopicId, payload);
    await loadAssignments(selectedTopicId);
  };

  const topicTitle = useMemo(() => topics.find((topic) => topic.id === selectedTopicId)?.title || "", [topics, selectedTopicId]);

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <Card title="Committee Management" subtitle="Assign panel members by topic">
        <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)}>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>

        {canManage ? (
          <form className="form" onSubmit={submit}>
            {rows.map((row, index) => (
              <div className="inline-row" key={`${index}-${row.role}`}>
                <select
                  value={row.lecturerId}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index].lecturerId = event.target.value;
                    setRows(next);
                  }}
                >
                  <option value="">Select lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.fullName}
                    </option>
                  ))}
                </select>
                <input
                  value={row.role}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index].role = event.target.value;
                    setRows(next);
                  }}
                  placeholder="Role"
                />
              </div>
            ))}
            <button type="button" className="ghost" onClick={addRow}>
              Add Row
            </button>
            <button type="submit">Save Committee</button>
          </form>
        ) : (
          <p>You can view committee assignments only.</p>
        )}
      </Card>

      <Card title="Current Assignments" subtitle={topicTitle}>
        <ul className="timeline">
          {assignments.map((item) => (
            <li key={item.id}>
              <strong>{item.lecturer.fullName}</strong>
              <p>{item.role}</p>
              <small>{item.lecturer.email}</small>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
