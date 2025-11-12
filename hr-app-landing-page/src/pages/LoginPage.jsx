import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  // Auto-focus on email input when page loads
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here, later we can integrate API-based authentication 

    console.log("Mock login with:", { email, password });

    // Simulate successful login
    if (onLoginSuccess) onLoginSuccess();
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome to ACDC HR Portal</h2>
        <p className="login-subtitle">Please sign in to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
            <FiMail className="input-icon-right" />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
