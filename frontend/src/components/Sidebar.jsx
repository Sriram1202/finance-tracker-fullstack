import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 bg-sky-100 text-sky-900 p-6 min-h-screen flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">Finance Tracker</h1>
        <nav className="flex flex-col space-y-3">
          <Link to="/dashboard" className="hover:text-sky-700">Dashboard</Link>
          <Link to="/expenses" className="hover:text-sky-700">Expenses</Link>
          <Link to="/transactions" className="hover:text-sky-700">Transactions</Link>
          <Link to="/reports" className="hover:text-sky-700">Reports</Link>
          <Link to="/summary" className="hover:text-sky-700">Summary</Link>
          <Link to="/profile" className="hover:text-sky-700">Profile</Link>
        </nav>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
