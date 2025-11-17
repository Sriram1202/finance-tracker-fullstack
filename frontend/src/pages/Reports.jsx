// src/pages/Reports.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = [
  "#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#F97316",
  "#22C55E", "#EAB308", "#3B82F6", "#A855F7", "#F43F5E"
];

export default function Reports() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeCategoryData, setRangeCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [error, setError] = useState("");
  

  // fetch category summary and monthly on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get("/expenses/summary/category"),
      api.get("/expenses/summary/monthly")
    ])
      .then(([catRes, monRes]) => {
        if (!mounted) return;
        // catRes.data is an object { "Food": 1200, "Travel": 300, ... }
        const catObj = catRes.data || {};
        const catArr = Object.keys(catObj).map((k) => ({ name: k, value: Number(catObj[k]) }));

        // monRes.data is { "2025-08": 1234, "2025-09": 900, ... }
        const monObj = monRes.data || {};
        // sort keys chronologically (YYYY-MM)
        const monArr = Object.keys(monObj)
          .sort()
          .map((k) => ({ month: k, total: Number(monObj[k]) }));

        setCategoryData(catArr);
        setMonthlyData(monArr);
      })
      .catch((err) => {
        console.error("Failed to load reports:", err);
        setError("Failed to load reports. Check backend connection.");
      })
      .finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  // fetch category summary in a date range
  const fetchRangeCategory = async () => {
    if (!rangeStart || !rangeEnd) {
      setError("Please choose both start and end dates.");
      return;
    }
    setRangeLoading(true);
    setError("");
    try {
      const res = await api.get("/expenses/summary/range/category", {
        params: { start: rangeStart, end: rangeEnd }
      });
      setRangeCategoryData(res.data || {});
    } catch (err) {
      console.error("Range fetch failed:", err);
      setError("Failed to fetch range data. Ensure backend is running and dates are correct.");
      setRangeCategoryData({});
    } finally {
      setRangeLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">Reports</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
              {categoryData.length === 0 ? (
                <p className="text-gray-600">No data</p>
              ) : (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => `${entry.name} (${Math.round(entry.value)})`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
              {monthlyData.length === 0 ? (
                <p className="text-gray-600">No data</p>
              ) : (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="total" name="Total" >
                        {monthlyData.map((entry, idx) => (
                          <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Range selector */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Category summary (by date range)</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600">Start</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">End</label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <button
                  onClick={fetchRangeCategory}
                  className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700"
                >
                  {rangeLoading ? "Loading..." : "Get Summary"}
                </button>
              </div>
            </div>

            {/* Range result */}
            <div className="mt-6">
              {Object.keys(rangeCategoryData).length === 0 ? (
                <p className="text-gray-600">No range data yet.</p>
              ) : (
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr className="bg-sky-100 text-sky-900">
                      <th className="p-3 border text-left">Category</th>
                      <th className="p-3 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(rangeCategoryData).map(([cat, val]) => (
                      <tr key={cat} className="hover:bg-sky-50">
                        <td className="p-3 border">{cat}</td>
                        <td className="p-3 border text-right">₹{Number(val).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
