import { useEffect, useState } from "react";
import { topicsApi } from "../api/topics";
import { uploadsApi } from "../api/workflow";
import { fileServerBaseUrl } from "../api/http";
import { Card } from "../components/Card";

export const UploadsPage = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [revisions, setRevisions] = useState([]);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const loadTopics = async () => {
    const { data } = await topicsApi.list();
    setTopics(data);
    if (!selectedTopicId && data[0]) {
      setSelectedTopicId(data[0].id);
    }
  };

  const loadRevisions = async (topicId) => {
    if (!topicId) {
      setRevisions([]);
      return;
    }
    const { data } = await uploadsApi.list(topicId);
    setRevisions(data);
  };

  useEffect(() => {
    loadTopics().catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load topic list"));
  }, []);

  useEffect(() => {
    loadRevisions(selectedTopicId).catch((loadError) => setError(loadError?.response?.data?.message || "Cannot load revisions"));
  }, [selectedTopicId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedTopicId || !file) {
      setError("Please choose a topic and file");
      return;
    }

    await uploadsApi.create(selectedTopicId, file, note);
    setFile(null);
    setNote("");
    await loadRevisions(selectedTopicId);
  };

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <Card title="Upload Revisions" subtitle="Upload revised files and keep a full revision timeline">
        <form className="form" onSubmit={submit}>
          <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <textarea placeholder="Revision note" value={note} onChange={(event) => setNote(event.target.value)} />
          <button type="submit">Upload Revision</button>
        </form>
      </Card>

      <Card title="Revision Timeline">
        <ul className="timeline">
          {revisions.map((revision) => (
            <li key={revision.id}>
              <strong>{revision.author.fullName}</strong>
              <p>{revision.note || "No note"}</p>
              <a href={`${fileServerBaseUrl}${revision.fileUrl}`} target="_blank" rel="noreferrer">
                Open uploaded file
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
