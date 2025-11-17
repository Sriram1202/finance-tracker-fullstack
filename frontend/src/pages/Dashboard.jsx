// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, txnRes] = await Promise.all([
          api.get("/transactions/summary/my"),
          api.get("/transactions/my", {
            params: {
              // get this month's range
              start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                .toISOString()
                .slice(0, 10),
              end: new Date().toISOString().slice(0, 10),
            },
          }),
        ]);

        setSummary(sumRes.data || { income: 0, expense: 0, balance: 0 });
        setRecent(txnRes.data ? txnRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">Dashboard</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div>Loading dashboard...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-gray-600 mb-2">Total Income</h2>
              <p className="text-2xl font-semibold text-green-600">
                ₹{summary.income?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-gray-600 mb-2">Total Expense</h2>
              <p className="text-2xl font-semibold text-red-600">
                ₹{summary.expense?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-gray-600 mb-2">Net Balance</h2>
              <p
                className={`text-2xl font-semibold ${
                  summary.balance >= 0 ? "text-sky-700" : "text-red-600"
                }`}
              >
                ₹{summary.balance?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-sky-800">
              Recent Transactions
            </h2>
            {recent.length === 0 ? (
              <p className="text-gray-600">No recent transactions found.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-sky-100 text-sky-900">
                    <th className="p-3 border text-left">Date</th>
                    <th className="p-3 border text-left">Description</th>
                    <th className="p-3 border text-left">Category</th>
                    <th className="p-3 border text-right">Amount</th>
                    <th className="p-3 border text-center">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className="hover:bg-sky-50">
                      <td className="p-3 border">{t.date}</td>
                      <td className="p-3 border">{t.description || "-"}</td>
                      <td className="p-3 border">{t.category || "-"}</td>
                      <td
                        className={`p-3 border text-right ${
                          t.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ₹{t.amount.toFixed(2)}
                      </td>
                      <td className="p-3 border text-center capitalize">
                        {t.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
