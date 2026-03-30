import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    studentCode: "",
    password: "",
    role: "STUDENT",
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        await register(form);
        setMode("login");
        return;
      }

      await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <h1>TopicFlow</h1>
        <p>Collaborative graduation topic management platform.</p>
        {error ? <p className="error">{error}</p> : null}
        <form className="form" onSubmit={onSubmit}>
          {mode === "register" ? (
            <>
              <input
                placeholder="Full name"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
              <input
                placeholder="Student code"
                value={form.studentCode}
                onChange={(event) => setForm((prev) => ({ ...prev, studentCode: event.target.value }))}
              />
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
              </select>
            </>
          ) : null}
          <input
            placeholder="Email"
            value={form.email}
            type="email"
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <button type="submit">{mode === "login" ? "Login" : "Create account"}</button>
          <button type="button" className="ghost" onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
            {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
