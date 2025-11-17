// src/pages/Summary.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Summary() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [currentData, setCurrentData] = useState({ income: 0, expense: 0, balance: 0 });
  const [previousData, setPreviousData] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMonthRange = (year, monthNum) => {
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [y, m] = month.split("-").map(Number);

      const { start, end } = getMonthRange(y, m);
      const { start: prevStart, end: prevEnd } =
        m === 1 ? getMonthRange(y - 1, 12) : getMonthRange(y, m - 1);

      const [currTxns, prevTxns] = await Promise.all([
        api.get("/transactions/my", { params: { start, end } }),
        api.get("/transactions/my", { params: { start: prevStart, end: prevEnd } }),
      ]);

      const calcSummary = (list) => {
        let income = 0, expense = 0;
        list.forEach((t) => {
          if (t.type === "credit") income += t.amount;
          else expense += t.amount;
        });
        return { income, expense, balance: income - expense };
      };

      setCurrentData(calcSummary(currTxns.data || []));
      setPreviousData(calcSummary(prevTxns.data || []));
    } catch (err) {
      console.error("Failed to load summary:", err);
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  const getChange = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
  };

  const changeColor = (val, positiveBetter = true) => {
    if (val === 0) return "text-gray-600";
    const better = val > 0;
    return better === positiveBetter ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">Monthly Financial Summary</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="mb-6">
        <label className="mr-3 font-medium text-sky-800">Select Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {loading ? (
        <div>Loading summary...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-gray-600 mb-2">Income</h2>
            <p className="text-2xl font-semibold text-green-600">
              ₹{currentData.income.toFixed(2)}
            </p>
            <p
              className={`text-sm ${changeColor(
                getChange(currentData.income, previousData.income),
                true
              )}`}
            >
              {getChange(currentData.income, previousData.income) >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(getChange(currentData.income, previousData.income)).toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-gray-600 mb-2">Expense</h2>
            <p className="text-2xl font-semibold text-red-600">
              ₹{currentData.expense.toFixed(2)}
            </p>
            <p
              className={`text-sm ${changeColor(
                getChange(currentData.expense, previousData.expense),
                false
              )}`}
            >
              {getChange(currentData.expense, previousData.expense) >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(getChange(currentData.expense, previousData.expense)).toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-gray-600 mb-2">Net Balance</h2>
            <p
              className={`text-2xl font-semibold ${
                currentData.balance >= 0 ? "text-sky-700" : "text-red-600"
              }`}
            >
              ₹{currentData.balance.toFixed(2)}
            </p>
            <p
              className={`text-sm ${changeColor(
                getChange(currentData.balance, previousData.balance),
                true
              )}`}
            >
              {getChange(currentData.balance, previousData.balance) >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(getChange(currentData.balance, previousData.balance)).toFixed(1)}% vs last month
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
