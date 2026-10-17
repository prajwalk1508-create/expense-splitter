import { useEffect, useState } from 'react';
import { listGroups, getErrorMessage } from '../api.js';

function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listGroups()
      .then((data) => setGroups(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="page"><p style={{ color: 'red' }}>❌ {error}</p></div>;

  return (
    <div className="page">
      <h1>🏠 Groups</h1>
      {groups.length === 0 ? (
        <p>No groups yet. Create one to get started.</p>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g._id}>
              <strong>{g.name}</strong> — {g.members.length} members
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;