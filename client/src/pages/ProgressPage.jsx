import { useEffect, useState } from "react";
import { progressApi, topicsApi } from "../api/topics";
import { Card } from "../components/Card";

export const ProgressPage = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: "", details: "", progress: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const { data } = await topicsApi.list();
        setTopics(data);
        if (data[0]) {
          setSelectedTopic(data[0].id);
        }
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Cannot load topics");
      }
    };

    loadTopics();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedTopic) {
        setEntries([]);
        return;
      }

      const { data } = await progressApi.list(selectedTopic);
      setEntries(data);
    };

    loadEntries();
  }, [selectedTopic]);

  const submitEntry = async (event) => {
    event.preventDefault();
    if (!selectedTopic) return;
    await progressApi.create(selectedTopic, { ...form, progress: Number(form.progress) });
    const { data } = await progressApi.list(selectedTopic);
    setEntries(data);
    setForm({ title: "", details: "", progress: 0 });
  };

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <Card title="Progress Tracker" subtitle="Post progress milestones and monitor updates">
        <div className="form">
          <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <form onSubmit={submitEntry} className="form">
            <input
              placeholder="Milestone title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <textarea
              placeholder="Milestone details"
              value={form.details}
              onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              required
            />
            <input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(event) => setForm((prev) => ({ ...prev, progress: event.target.value }))}
            />
            <button type="submit">Add Progress Entry</button>
          </form>
        </div>
      </Card>
      <Card title="Progress Timeline">
        <ul className="timeline">
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.title}</strong>
              <p>{entry.details}</p>
              <small>
                {entry.progress}% by {entry.author.fullName}
              </small>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
