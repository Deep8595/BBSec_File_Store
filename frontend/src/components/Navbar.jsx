export default function Navbar({
  fileInfo,
  hashValue,
  onOpenDocuments,
  onOpenAuth,
  currentUser,
}) {
  const blockchainStatus = hashValue
    ? "Blockchain connected"
    : "Blockchain disconnected";
  const decryptionStatus = fileInfo
    ? "Decryption ready"
    : "Decryption disconnected";

  return (
    <nav className="navbar">
      <div className="brand-group">
        <div className="brand-mark">BS</div>
        <div>
          <h2>BBSec File Store</h2>
          <p>Blockchain-secured document workflow</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className="secondary-btn"
          type="button"
          onClick={onOpenDocuments}
        >
          View uploaded documents
        </button>
        <button className="primary-btn" type="button" onClick={onOpenAuth}>
          {currentUser
            ? currentUser.name || currentUser.email
            : "Login / Sign up"}
        </button>
        <span className="status-pill">
          <span className="status-dot" />
          {blockchainStatus}
        </span>
        <span className="status-pill">
          <span className="status-dot" />
          {decryptionStatus}
        </span>
      </div>
    </nav>
  );
}
