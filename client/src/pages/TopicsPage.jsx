import { useEffect, useState } from "react";
import { TopicForm } from "../components/TopicForm";
import { TopicList } from "../components/TopicList";
import { usersApi, topicsApi } from "../api/topics";
import { Card } from "../components/Card";

export const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [topicsResponse, lecturersResponse] = await Promise.all([topicsApi.list(), usersApi.list("LECTURER")]);
      setTopics(topicsResponse.data);
      setLecturers(lecturersResponse.data);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load topic data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (payload) => {
    await topicsApi.create(payload);
    await loadData();
  };

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      <TopicForm lecturers={lecturers} onSubmit={onSubmit} />
      <Card title="Topic Registry" subtitle="All submitted topics and member assignments">
        <TopicList topics={topics} />
      </Card>
    </div>
  );
};
