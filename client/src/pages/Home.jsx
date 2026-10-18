import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listGroups, createGroup, getErrorMessage } from '../api.js';
import Spinner from '../components/Spinner.jsx';

function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [members, setMembers] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch groups on mount
  useEffect(() => {
    listGroups()
      .then(setGroups)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Member helpers
  const updateMember = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, '']);
  };

  const removeMember = (index) => {
    if (members.length <= 2) return; // keep at least 2
    setMembers(members.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedMembers = members.map((m) => m.trim()).filter((m) => m !== '');

    if (!trimmedName) {
      setFormError('Group name is required');
      return;
    }

    if (trimmedMembers.length < 2) {
      setFormError('At least 2 members are required');
      return;
    }

    const unique = new Set(trimmedMembers);
    if (unique.size !== trimmedMembers.length) {
      setFormError('Member names must be unique');
      return;
    }

    setSubmitting(true);

    try {
      const newGroup = await createGroup({
        name: trimmedName,
        members: trimmedMembers,
      });

      // Add to list
      setGroups([newGroup, ...groups]);

      // Reset form
      setName('');
      setMembers(['', '']);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Render
  if (loading) {
  return (
    <div className="page">
      <Spinner label="Loading groups..." />
    </div>
  );
}
  if (error) return <div className="page"><p className="error">❌ {error}</p></div>;

  return (
    <div className="page">
      <h1>💸 Expense Splitter</h1>

      <section className="card">
        <h2>Create a Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Goa Trip 2025"
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <label>Members</label>
            {members.map((member, i) => (
              <div key={i} className="member-row">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => updateMember(i, e.target.value)}
                  placeholder={`Member ${i + 1}`}
                />
                {members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="btn-remove"
                    title="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addMember} className="btn-secondary">
              + Add member
            </button>
          </div>

          {formError && <p className="error">⚠ {formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Your Groups</h2>
        {groups.length === 0 ? (
          <p>No groups yet. Create one above.</p>
        ) : (
        <ul className="group-list">
          {groups.map((g) => (
           <li key={g._id}>
             <Link to={`/group/${g._id}`} className="group-link">
               <strong>{g.name}</strong>
                 <span className="muted"> — {g.members.length} members</span>
              </Link>
            </li>
           ))}
         </ul>
        )}
      </section>
    </div>
  );
}

export default Home;