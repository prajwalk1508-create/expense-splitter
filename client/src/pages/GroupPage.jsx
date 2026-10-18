import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroup, listExpenses, createExpense, getErrorMessage } from '../api.js';

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
        setError(getErrorMessage(err));
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

  // Submit handler
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
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Render states
  if (loading) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Back to Groups</Link>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Back to Groups</Link>
        <p className="error">❌ {error}</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to Groups</Link>

      <h1>{group.name}</h1>
      <p className="muted">
        {group.members.length} members · {expenses.length} expenses
      </p>

      <section className="card">
        <h2>Members</h2>
        <ul className="member-list">
          {group.members.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

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

      <section className="card">
        <h2>Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className="expense-list">
            {expenses.map((exp) => (
              <li key={exp._id}>
                <strong>{exp.paidBy}</strong> paid ₹{(exp.amount / 100).toFixed(2)} for {exp.description}
                <span className="muted"> (split among {exp.splitAmong.length})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default GroupPage;