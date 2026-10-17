import { useParams } from 'react-router-dom';

function GroupPage() {
  const { id } = useParams();

  return (
    <div className="page">
      <h1>👥 Group Page</h1>
      <p>Group ID: <code>{id}</code></p>
      <p>Group details will appear here.</p>
    </div>
  );
}

export default GroupPage;