// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { username, email, password } = formData;

    // ✅ Basic client-side validation
    if (!username || !email || !password) {
      setError("⚠️ All fields are required.");
      return;
    }

    try {
      // ✅ Send register request
      const res = await api.post("/users/register", {
        username,
        email,
        password,
      });

      if (res.status === 200 || res.status === 201) {
        setSuccess("🎉 Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("❌ Registration error:", err);

      // Backend validation messages
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data) {
        setError(typeof err.response.data === "string"
          ? err.response.data
          : "⚠️ Registration failed. Please try again.");
      } else {
        setError("⚠️ Server unreachable. Please check your connection.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">
          Create an Account
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 mb-4 rounded text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 text-green-700 p-2 mb-4 rounded text-center">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sky-800 font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-sky-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sky-800 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-sky-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sky-800 font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-sky-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded transition duration-200"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
