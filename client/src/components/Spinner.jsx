function Spinner({ size = 'medium', label = 'Loading...' }) {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`} />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}

export default Spinner;