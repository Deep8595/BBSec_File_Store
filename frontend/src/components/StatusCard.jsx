export default function StatusCard({ status, fileInfo, hashValue }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Status</h3>
        <span className="chip">Live</span>
      </div>

      <div className="status-list">
        <div className="status-item">
          <span className="status-dot" />
          {status}
        </div>
        <div className="status-item">
          <span className="status-dot" />
          {fileInfo ? `File: ${fileInfo.fileName}` : "No file uploaded yet"}
        </div>
        <div className="status-item">
          <span className="status-dot" />
          {hashValue
            ? `Hash ready: ${hashValue.slice(0, 24)}...`
            : "Hash pending"}
        </div>
        <div className="status-item">
          <span className="status-dot" />
          {fileInfo?.googleDrive?.webViewLink
            ? `Google Drive: ${fileInfo.googleDrive.name}`
            : "Google Drive upload not used"}
        </div>
        <div className="status-item">
          <span className="status-dot" />
          {fileInfo ? "Decryption: ready" : "Decryption: disconnected"}
        </div>
        <div className="status-item">
          <span className="status-dot" />
          {hashValue ? "Blockchain: connected" : "Blockchain: disconnected"}
        </div>
      </div>
    </div>
  );
}
