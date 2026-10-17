import { useParams, Link } from 'react-router-dom';

function GroupPage() {
  const { id } = useParams();

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to Groups</Link>
      <h1>👥 Group Page</h1>
      <p>Group ID: <code>{id}</code></p>
      <p className="muted">Group details will appear here in the next steps.</p>
    </div>
  );
}

export default GroupPage;