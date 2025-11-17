import { useState } from "react";
import api from "../services/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const categories = [
    "Food",
    "Grocery",
    "Tea",
    "Fruit",
    "Fee",
    "Petrol",
    "Shopping",
    "Bills",
    "Entertainment",
    "Others",
  ];

  const fetchExpenses = async (start, end) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await api.get("/expenses/my", { params: { start, end } });
      setExpenses(Array.isArray(res.data) ? res.data : []);
      setFilterApplied(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const { title, amount, category, date } = newExpense;
    if (!title || !amount || !category || !date) {
      setError("All fields are required.");
      return;
    }

    try {
      const payload = { ...newExpense, amount: parseFloat(amount) };
      await api.post("/expenses/add", payload);
      setNewExpense({ title: "", amount: "", category: "", date: "" });
      if (filterStart && filterEnd) await fetchExpenses(filterStart, filterEnd);
      window.dispatchEvent(new Event("transactionUpdated"));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to add expense.");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/delete/${id}`);
      if (filterStart && filterEnd) await fetchExpenses(filterStart, filterEnd);
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (err) {
      console.error(err);
      setError("Failed to delete expense.");
    }
  };

  const applyFilter = async (e) => {
    e.preventDefault();
    if (!filterStart || !filterEnd) {
      setError("Please select both start and end dates.");
      return;
    }
    setError("");
    await fetchExpenses(filterStart, filterEnd);
  };

  const clearFilter = () => {
    setFilterStart("");
    setFilterEnd("");
    setExpenses([]);
    setFilterApplied(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">My Expenses</h1>

      {/* Add Expense Form */}
      <form
        onSubmit={handleAddExpense}
        className="bg-sky-50 p-6 rounded-2xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <input
          type="text"
          placeholder="Title"
          value={newExpense.title}
          onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={newExpense.category}
          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={newExpense.date}
          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          className="p-2 border rounded"
        />
        <button type="submit" className="col-span-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded">
          Add Expense
        </button>
      </form>

      {/* Filter Section */}
      <form onSubmit={applyFilter} className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm text-gray-600">Start</label>
          <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End</label>
          <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="border p-2 rounded" />
        </div>
        <button className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700" type="submit">
          Apply
        </button>
        <button className="bg-gray-200 text-gray-800 py-2 px-3 rounded" onClick={(e) => { e.preventDefault(); clearFilter(); }}>
          Clear
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!filterApplied ? (
        <p className="text-gray-600 italic">Use the filter to view expenses.</p>
      ) : loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-600">No expenses found in this range.</p>
      ) : (
        <table className="w-full border-collapse shadow-sm">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-sky-50 text-center">
                <td className="p-3 border">{exp.title}</td>
                <td className="p-3 border">₹{exp.amount}</td>
                <td className="p-3 border">{exp.category}</td>
                <td className="p-3 border">{exp.date}</td>
                <td className="p-3 border">
                  <button onClick={() => handleDeleteExpense(exp.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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
