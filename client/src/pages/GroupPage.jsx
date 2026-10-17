import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroup, listExpenses, getErrorMessage } from '../api.js';

function GroupPage() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([getGroup(id), listExpenses(id)])
      .then(([groupData, expensesData]) => {
        if (cancelled) return;
        setGroup(groupData);
        setExpenses(expensesData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
        <h2>Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className="expense-list">
            {expenses.map((exp) => (
              <li key={exp._id}>
                <strong>{exp.paidBy}</strong> paid ₹{(exp.amount / 100).toFixed(2)} for {exp.description}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default GroupPage;