import { useEffect, useState } from "react";
import api from "../services/api";
import {
  User,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
} from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, summaryRes, txnRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/transactions/summary/my"),
          api.get("/transactions/my", {
            params: {
              start: new Date(
                new Date().setDate(new Date().getDate() - 30)
              ).toISOString().split("T")[0],
              end: new Date().toISOString().split("T")[0],
            },
          }),
        ]);
        setProfile(profileRes.data);
        setSummary(summaryRes.data);
        setTxnCount(txnRes.data.length);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return <div className="p-8 text-gray-600">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-sky-900 mb-6">My Profile</h1>

        {/* User Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-4 rounded-full">
              <User size={36} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-sky-800">
                {profile.username}
              </h2>
              <p className="flex items-center text-gray-600 gap-2">
                <Mail size={16} /> {profile.email}
              </p>
              <p className="flex items-center text-gray-600 gap-2">
                <Calendar size={16} /> Active user since 2025
              </p>
            </div>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow">
            Active User
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Income</span>
              <TrendingUp className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              ₹{summary.income.toFixed(2)}
            </p>
          </div>
          <div className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Expense</span>
              <TrendingDown className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700">
              ₹{summary.expense.toFixed(2)}
            </p>
          </div>
          <div className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Net Balance</span>
              <Wallet className="text-sky-600" />
            </div>
            <p className="text-2xl font-bold text-sky-800">
              ₹{summary.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-sky-50 rounded-xl p-6 shadow-sm border border-sky-100">
          <h3 className="text-xl font-semibold text-sky-800 mb-4 flex items-center gap-2">
            <Activity size={22} /> Activity Overview
          </h3>
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <p className="text-gray-700">
              You’ve made <span className="font-semibold">{txnCount}</span>{" "}
              transactions in the past 30 days.
            </p>
            <div className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg cursor-pointer text-center transition">
              Edit Profile (Coming Soon)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
