import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [dashboard, setDashboard] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    insight: "",
  });

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
  });

  const [isLogin, setIsLogin] = useState(true);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [user, setUser] = useState(localStorage.getItem("token"));
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  // ================= AUTH =================
  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await axios.post(
          "https://expense-tracker-ai-insights-2.onrender.com/api/auth/login",
          {
            email: authForm.email,
            password: authForm.password,
          }
        );

        localStorage.setItem("token", res.data.token);
        setUser(res.data.token);
      } else {
        await axios.post(
          "https://expense-tracker-ai-insights-2.onrender.com/api/auth/register",
          authForm
        );
        alert("Signup successful! Login now");
        setIsLogin(true);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTransactions([]);
  };

  // ================= FETCH =================
  const fetchDashboard = async () => {
    const res = await axios.get(
      "https://expense-tracker-ai-insights-2.onrender.com/api/dashboard",
      config
    );
    setDashboard(res.data);
  };

  const fetchTransactions = async () => {
    const res = await axios.get(
      "https://expense-tracker-ai-insights-2.onrender.com/api/transactions",
      config
    );
    setTransactions(res.data);
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
      fetchTransactions();
    }
  }, [user]);

  // ================= ADD / UPDATE =================
  const addTransaction = async (e) => {
    e.preventDefault();

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
    };

    try {
      if (editingId) {
        await axios.put(
          `https://expense-tracker-ai-insights-2.onrender.com/api/transactions/${editingId}`,
          payload,
          config
        );
        setEditingId(null);
      } else {
        await axios.post(
          "https://expense-tracker-ai-insights-2.onrender.com/api/transactions",
          payload,
          config
        );
      }

      setForm({ type: "expense", amount: "", category: "", description: "" });

      fetchDashboard();
      fetchTransactions();
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  // ================= DELETE =================
  const deleteTransaction = async (id) => {
    await axios.delete(
      `https://expense-tracker-ai-insights-2.onrender.com/api/transactions/${id}`,
      config
    );

    fetchDashboard();
    fetchTransactions();
  };

  // ================= AUTH SCREEN =================
  if (!user) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authBox}>
          <h2>{isLogin ? "Login 🔐" : "Signup 🧾"}</h2>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <input
                style={styles.input}
                placeholder="Name"
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
              />
            )}

            <input
              style={styles.input}
              placeholder="Email"
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />

            <button style={styles.primaryBtn}>
              {isLogin ? "Login" : "Signup"}
            </button>
          </form>

          <p style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create account" : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  // ================= PIE CHART =================
  const expenseData = transactions.filter((t) => t.type === "expense");

  const expenseByCategory = expenseData.reduce((acc, curr) => {
    const key = (curr.category || "other").toLowerCase().trim();
    acc[key] = (acc[key] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const pieData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  }));

  const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0"];

  // ================= MAIN UI =================
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>💰 Expense Tracker</h1>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* DASHBOARD */}
        <div style={styles.dashboard}>
          <div style={{ ...styles.card, background: "#e8f5e9" }}>
            <h3>Income</h3>
            <p>₹ {dashboard.income}</p>
          </div>

          <div style={{ ...styles.card, background: "#ffebee" }}>
            <h3>Expense</h3>
            <p>₹ {dashboard.expense}</p>
          </div>

          <div style={{ ...styles.card, background: "#e3f2fd" }}>
            <h3>Balance</h3>
            <p>₹ {dashboard.balance}</p>
          </div>
        </div>

        {/* INSIGHT */}
        <div style={styles.insightBox}>
          AI Insight: {dashboard.insight}
        </div>

        {/* PIE CHART */}
        <div style={styles.chartBox}>
          <h2>📊 Expense Analysis</h2>
          <PieChart width={400} height={300}>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* FORM */}
        <div style={styles.formBox}>
          <h2>{editingId ? "✏️ Edit Transaction" : "➕ Add Transaction"}</h2>

          <form onSubmit={addTransaction} style={styles.form}>
            <select
              style={styles.input}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <input
              style={styles.input}
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button style={styles.addBtn}>
              {editingId ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* TRANSACTIONS */}
        <h2>📋 Transactions</h2>

        {transactions.map((t) => (
          <div key={t._id} style={styles.transactionCard}>
            <div>
              <h3>{t.category}</h3>
              <p>{t.description}</p>
              <p>₹ {t.amount}</p>
              <span>{t.type}</span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={styles.editBtn}
                onClick={() => {
                  setEditingId(t._id);
                  setForm({
                    type: t.type,
                    amount: t.amount,
                    category: t.category,
                    description: t.description,
                  });
                }}
              >
                Edit
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteTransaction(t._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

// ================= STYLES =================
const styles = {
  app: {
    background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
    minHeight: "100vh",
    fontFamily: "Segoe UI",
  },

  container: {
    maxWidth: "950px",
    margin: "auto",
    padding: "25px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoutBtn: {
    background: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  dashboard: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
  },

  card: {
    flex: 1,
    padding: "18px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  },

  insightBox: {
    marginTop: "20px",
    background: "#fff3cd",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },

  chartBox: {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },

  formBox: {
    marginTop: "30px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
  },

  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    flex: 1,
  },

  addBtn: {
    background: "linear-gradient(135deg, #4caf50, #2e7d32)",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  transactionCard: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    padding: "15px",
    marginTop: "12px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  editBtn: {
    background: "#2196f3",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "6px",
  },

  deleteBtn: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "6px",
  },

  authContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
  },

  authBox: {
    background: "white",
    padding: "35px",
    borderRadius: "12px",
    width: "320px",
    textAlign: "center",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #4caf50, #2e7d32)",
    color: "white",
    border: "none",
    borderRadius: "8px",
  },

  link: {
    marginTop: "12px",
    color: "#1976d2",
    cursor: "pointer",
  },
};
