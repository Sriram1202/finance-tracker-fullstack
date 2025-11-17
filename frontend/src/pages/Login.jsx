// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect after successful login
  useEffect(() => {
    if (!loading && token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/users/login", { username, password });

      if (res.data && res.data.token) {
        // ✅ Save token to context
        login(res.data.token);

        // ✅ Try fetching user profile immediately after login
        try {
          const profileRes = await api.get("/users/profile");
          if (profileRes.data && profileRes.data.id) {
            localStorage.setItem("userId", profileRes.data.id);
            console.log("DEBUG: Stored userId =", profileRes.data.id);
          } else {
            console.warn("Profile endpoint didn't return a valid user id", profileRes.data);
          }
        } catch (profileErr) {
          console.error("Failed to fetch user profile:", profileErr);
        }

        // navigation handled by useEffect
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("❌ Invalid username or password");
    }
  };

  if (loading) return <div className="p-6">Checking authentication...</div>;
  if (token) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Finance Tracker
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to your account
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
