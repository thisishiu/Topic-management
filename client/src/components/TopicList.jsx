import { Card } from "./Card";

export const TopicList = ({ topics }) => {
  return (
    <div className="topic-grid">
      {topics.map((topic) => (
        <Card
          key={topic.id}
          title={topic.title}
          subtitle={`Status: ${topic.status.replaceAll("_", " ")}`}
        >
          <p>{topic.description}</p>
          <p>
            Fields: {topic.fields.join(", ")}
          </p>
          <p>
            Members: {topic.members.map((item) => item.student.fullName).join(", ")}
          </p>
        </Card>
      ))}
    </div>
  );
};
