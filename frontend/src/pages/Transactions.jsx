import { useEffect, useState } from "react";
import api from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "debit",
    categoryId: "",
    date: "",
  });

  const [categories, setCategories] = useState([]);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Failed to load categories:", err);
      setCategories([]);
    }
  };

  const fetchTransactions = async (start, end) => {
    if (!start || !end) return; // only fetch if both dates are given
    setLoading(true);
    try {
      const params = { start, end };
      const res = await api.get("/transactions/my", { params });
      let txns = Array.isArray(res.data) ? res.data : [];

      txns = txns
        .map((t) => ({
          ...t,
          amount: Number(t.amount),
          date: t.date,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(txns);
      setFilterApplied(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const { description, amount, date, categoryId, type } = newTransaction;
    if (!description || !amount || !date) {
      setError("Please fill description, amount, and date.");
      return;
    }

    try {
      await api.post(`/transactions/add?categoryId=${categoryId || ""}`, {
        description,
        amount: parseFloat(amount),
        type,
        date,
      });

      setNewTransaction({
        description: "",
        amount: "",
        type: "debit",
        categoryId: "",
        date: "",
      });

      if (filterStart && filterEnd) await fetchTransactions(filterStart, filterEnd);
      window.dispatchEvent(new Event("transactionUpdated"));
      setError("");
    } catch (err) {
      console.error("Add transaction failed:", err);
      setError("Failed to add transaction.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      if (filterStart && filterEnd) await fetchTransactions(filterStart, filterEnd);
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (err) {
      console.error(err);
      setError("Failed to delete transaction.");
    }
  };

  const applyFilter = async (e) => {
    e?.preventDefault();
    if ((filterStart && !filterEnd) || (!filterStart && filterEnd)) {
      setError("Please select both start and end dates.");
      return;
    }
    setError("");
    await fetchTransactions(filterStart, filterEnd);
  };

  const clearFilter = () => {
    setFilterStart("");
    setFilterEnd("");
    setTransactions([]);
    setFilterApplied(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">My Transactions</h1>

      {/* Add Transaction Form */}
      <form
        onSubmit={handleAdd}
        className="bg-sky-50 p-6 rounded-2xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <input
          type="text"
          placeholder="Description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="debit">Expense</option>
          <option value="credit">Income</option>
        </select>
        <select
          value={newTransaction.categoryId}
          onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="col-span-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded"
        >
          Add Transaction
        </button>
      </form>

      {/* Filter Section */}
      <form onSubmit={applyFilter} className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm text-gray-600">Start</label>
          <input
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End</label>
          <input
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700" type="submit">
          Apply
        </button>
        <button
          className="bg-gray-200 text-gray-800 py-2 px-3 rounded"
          onClick={(e) => {
            e.preventDefault();
            clearFilter();
          }}
        >
          Clear
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!filterApplied ? (
        <p className="text-gray-600 italic">Use the filter to view transactions.</p>
      ) : loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-600">No transactions found in this range.</p>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-sky-50 text-center">
                <td className="p-3 border">{t.description}</td>
                <td className="p-3 border">
                  ₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className={`p-3 border font-semibold ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {t.type}
                </td>
                <td className="p-3 border">{t.category?.name || "N/A"}</td>
                <td className="p-3 border">{t.date}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
