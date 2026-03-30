import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  proposalFileUrl: "",
  fields: "Software Engineering,AI",
  supervisorId: "",
  memberStudentCodes: "",
};

export const TopicForm = ({ lecturers, onSubmit }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [form]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await onSubmit({
        ...form,
        fields: form.fields.split(",").map((item) => item.trim()).filter(Boolean),
        memberStudentCodes: form.memberStudentCodes.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setForm(initialState);
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Unable to submit topic");
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3>Register New Topic</h3>
      {error ? <p className="error">{error}</p> : null}
      <input
        placeholder="Topic title"
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        required
      />
      <textarea
        placeholder="Topic description"
        rows={4}
        value={form.description}
        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        required
      />
      <input
        placeholder="Proposal file URL"
        value={form.proposalFileUrl}
        onChange={(event) => setForm((prev) => ({ ...prev, proposalFileUrl: event.target.value }))}
      />
      <input
        placeholder="Fields (comma separated)"
        value={form.fields}
        onChange={(event) => setForm((prev) => ({ ...prev, fields: event.target.value }))}
      />
      <input
        placeholder="Member student codes (comma separated, max 2)"
        value={form.memberStudentCodes}
        onChange={(event) => setForm((prev) => ({ ...prev, memberStudentCodes: event.target.value }))}
        required
      />
      <select
        value={form.supervisorId}
        onChange={(event) => setForm((prev) => ({ ...prev, supervisorId: event.target.value }))}
      >
        <option value="">Select lecturer</option>
        {lecturers.map((lecturer) => (
          <option key={lecturer.id} value={lecturer.id}>
            {lecturer.fullName}
          </option>
        ))}
      </select>
      <button type="submit">Submit Topic</button>
    </form>
  );
};
