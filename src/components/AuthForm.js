import React, { useState } from "react";
import axios from "axios";

const AuthForm = ({ mode, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // only for signup
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `/api/auth/${mode}`;
      const payload =
        mode === "signup" ? { username, email, password } : { email, password };

      const res = await axios.post(url, payload);

      // Store tokens here
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      onAuthSuccess(res.data.user); // pass user to parent
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {mode === "signup" && (
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="form-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {mode === "signup" ? "🚀 Sign Up" : "🔑 Sign In"}
      </button>
      {error && (
        <div style={{ 
          color: "var(--error)", 
          background: "var(--error-light)", 
          padding: "var(--space-3)", 
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--error)",
          fontSize: "0.9rem",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}
    </form>
  );
};

const styles = {};

export default AuthForm;
