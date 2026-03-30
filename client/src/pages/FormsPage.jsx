import { useEffect, useState } from "react";
import { topicsApi } from "../api/topics";
import { formsApi } from "../api/workflow";
import { fileServerBaseUrl } from "../api/http";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";

export const FormsPage = () => {
  const { user } = useAuth();
  const canScore = ["LECTURER", "DEPARTMENT_HEAD", "ADMIN"].includes(user?.role);

  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState({ score: 8, feedback: "", signatureUrl: "" });
  const [error, setError] = useState("");

  const loadTopics = async () => {
    const { data } = await topicsApi.list();
    setTopics(data);
    if (!selectedTopicId && data[0]) {
      setSelectedTopicId(data[0].id);
    }
  };

  const loadScores = async (topicId) => {
    if (!topicId) {
      setScores([]);
      return;
    }
    const { data } = await formsApi.list(topicId);
    setScores(data);
  };

  useEffect(() => {
    loadTopics().catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load topic list"));
  }, []);

  useEffect(() => {
    loadScores(selectedTopicId).catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load score forms"));
  }, [selectedTopicId]);

  const submitScore = async (event) => {
    event.preventDefault();
    await formsApi.create(selectedTopicId, { ...form, score: Number(form.score) });
    setForm({ score: 8, feedback: "", signatureUrl: "" });
    await loadScores(selectedTopicId);
  };

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <Card title="Evaluation Forms" subtitle="Create and export PDF-based scoring forms">
        <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)}>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
        {canScore ? (
          <form className="form" onSubmit={submitScore}>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={form.score}
              onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))}
            />
            <textarea
              rows={3}
              placeholder="Feedback"
              value={form.feedback}
              onChange={(event) => setForm((prev) => ({ ...prev, feedback: event.target.value }))}
              required
            />
            <input
              placeholder="Signature URL (optional)"
              value={form.signatureUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, signatureUrl: event.target.value }))}
            />
            <button type="submit">Submit Score Form</button>
          </form>
        ) : (
          <p>You can view forms but cannot create scoring forms with your role.</p>
        )}
      </Card>

      <Card title="Submitted Score Forms">
        <ul className="timeline">
          {scores.map((item) => (
            <li key={item.id}>
              <strong>{item.author.fullName}</strong>
              <p>Score: {item.score}</p>
              <p>{item.feedback}</p>
              {item.pdfUrl ? (
                <a href={`${fileServerBaseUrl}${item.pdfUrl}`} target="_blank" rel="noreferrer">
                  Open generated PDF
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
