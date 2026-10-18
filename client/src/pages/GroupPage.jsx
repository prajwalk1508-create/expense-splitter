import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroup, listExpenses, createExpense, deleteExpense, getErrorMessage } from '../api.js';
import { calculateBalances, simplifyDebts } from '../utils/splitAlgorithm.js';
import Spinner from '../components/Spinner.jsx';
import Toast from '../components/Toast.jsx';

function GroupPage() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitAmong, setSplitAmong] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Fetch group + expenses
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([getGroup(id), listExpenses(id)])
      .then(([groupData, expensesData]) => {
        if (cancelled) return;
        setGroup(groupData);
        setExpenses(expensesData);
        setPaidBy(groupData.members[0] || '');
        setSplitAmong(groupData.members);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = getErrorMessage(err);
        setError(msg);
        setToast({ message: msg, type: 'error' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // Toggle a member in splitAmong
  const toggleSplit = (member) => {
    setSplitAmong((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  // Submit handler for adding expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const amountRupees = parseFloat(amount);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }

    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }

    if (splitAmong.length === 0) {
      setFormError('Select at least one person to split among');
      return;
    }

    const amountPaise = Math.round(amountRupees * 100);

    setSubmitting(true);
    try {
      const newExpense = await createExpense({
        groupId: id,
        paidBy,
        amount: amountPaise,
        description: description.trim(),
        splitAmong,
      });

      setExpenses([...expenses, newExpense]);

      // Reset form
      setAmount('');
      setDescription('');
      setPaidBy(group.members[0] || '');
      setSplitAmong(group.members);
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter((e) => e._id !== expenseId));
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      setToast({ message: msg, type: 'error' });
    }
  };

  // Render states
  if (loading) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Back to Groups</Link>
        <Spinner label="Loading group..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Back to Groups</Link>
        <p className="error">❌ {error}</p>
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'error' })}
        />
      </div>
    );
  }

  if (!group) return null;

  const balances = calculateBalances(expenses, group.members);
  const settlements = simplifyDebts(balances);

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to Groups</Link>

      <h1>{group.name}</h1>
      <p className="muted">
        {group.members.length} members · {expenses.length} expenses
      </p>

      {/* Members */}
      <section className="card">
        <h2>Members</h2>
        <ul className="member-list">
          {group.members.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      {/* Balances */}
      <section className="card">
        <h2>Balances</h2>
        {balances.length === 0 ? (
          <p>No balances yet.</p>
        ) : (
          <ul className="balance-list">
            {balances.map((b) => (
              <li key={b.name} className="balance-item">
                <span>{b.name}</span>
                <span
                  className={
                    b.balance > 0
                      ? 'positive'
                      : b.balance < 0
                      ? 'negative'
                      : 'neutral'
                  }
                >
                  {b.balance > 0 ? 'gets back ' : b.balance < 0 ? 'owes ' : 'settled '}
                  ₹{Math.abs(b.balance / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Settle Up */}
      <section className="card">
        <h2>Settle Up</h2>
        {settlements.length === 0 ? (
          <p>Everyone is settled up! 🎉</p>
        ) : (
          <ul className="settlement-list">
            {settlements.map((s, index) => (
              <li key={index} className="settlement-item">
                <strong>{s.from}</strong> pays <strong>{s.to}</strong>{' '}
                <span className="settlement-amount">₹{(s.amount / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Expense form */}
      <section className="card">
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Paid by</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {group.members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 2000.50"
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner"
              maxLength={200}
            />
          </div>

          <div className="form-row">
            <label>Split among</label>
            <div className="checkbox-group">
              {group.members.map((m) => (
                <label key={m} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={splitAmong.includes(m)}
                    onChange={() => toggleSplit(m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {formError && <p className="error">⚠ {formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </section>

      {/* Expenses list with delete */}
      <section className="card">
        <h2>Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className="expense-list">
            {expenses.map((exp) => (
              <li key={exp._id} className="expense-item">
                <div className="expense-info">
                  <strong>{exp.paidBy}</strong> paid ₹{(exp.amount / 100).toFixed(2)} for {exp.description}
                  <span className="muted"> (split among {exp.splitAmong.length})</span>
                </div>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => handleDeleteExpense(exp._id)}
                  title="Delete expense"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'error' })}
      />
    </div>
  );
}

export default GroupPage;