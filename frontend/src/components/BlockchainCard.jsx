import { useState } from "react";
import { storeHash, verifyHash } from "../services/api";

function formatTimestamp(storedAt) {
  if (!storedAt) return "Not stored yet";
  const date = new Date(storedAt);
  if (Number.isNaN(date.getTime())) return storedAt;
  return date.toLocaleString();
}

export default function BlockchainCard({ fileInfo, hashValue, onStatus }) {
  const [loading, setLoading] = useState(false);
  const [blockchainInfo, setBlockchainInfo] = useState(null);

  async function handleStore() {
    if (!fileInfo?.fileName || !hashValue) {
      onStatus("Generate a hash before storing");
      return;
    }

    setLoading(true);
    onStatus("Storing hash on blockchain...");

    try {
      const response = await storeHash(fileInfo.fileName, hashValue);
      setBlockchainInfo({
        status: response.status || "stored",
        fileName: response.fileName,
        currentHash: response.hash,
        storedHash: response.storedHash,
        storedAt: response.storedAt,
        message: response.message,
      });
      onStatus(
        `Stored ${response.hash} at ${formatTimestamp(response.storedAt)}`,
      );
    } catch (error) {
      onStatus(error.message || "Storage failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!fileInfo?.fileName || !hashValue) {
      onStatus("Generate a hash before verifying");
      return;
    }

    setLoading(true);
    onStatus("Verifying hash integrity...");

    try {
      const response = await verifyHash(fileInfo.fileName, hashValue);
      setBlockchainInfo({
        status: response.status || "verified",
        fileName: response.fileName,
        currentHash: response.currentHash,
        storedHash: response.storedHash,
        storedAt: response.storedAt,
        message: response.message,
      });
      onStatus(
        `${response.message}${response.storedAt ? ` • Stored ${formatTimestamp(response.storedAt)}` : ""}`,
      );
    } catch (error) {
      onStatus(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Blockchain</h3>
        <span className="chip">Immutable</span>
      </div>

      <div className="action-row">
        <button
          className="primary-btn"
          onClick={handleStore}
          disabled={loading}
        >
          {loading ? "Working..." : "Store Hash"}
        </button>
        <button
          className="secondary-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          Verify Hash
        </button>
      </div>

      <div className="detail-list" style={{ marginTop: 16 }}>
        <div className="detail-item">
          <span className="field-label">Status</span>
          <strong>
            {blockchainInfo?.message || "No blockchain record yet"}
          </strong>
        </div>
        <div className="detail-item">
          <span className="field-label">File</span>
          <strong>{fileInfo?.fileName || "Upload a file first"}</strong>
        </div>
        <div className="detail-item">
          <span className="field-label">Current hash</span>
          <strong>
            {hashValue ? `${hashValue.slice(0, 16)}…` : "Not generated"}
          </strong>
        </div>
        <div className="detail-item">
          <span className="field-label">Stored hash</span>
          <strong>
            {blockchainInfo?.storedHash
              ? `${blockchainInfo.storedHash.slice(0, 16)}…`
              : "Not stored"}
          </strong>
        </div>
        <div className="detail-item">
          <span className="field-label">Stored at</span>
          <strong>{formatTimestamp(blockchainInfo?.storedAt)}</strong>
        </div>
      </div>

      <p className="field-label" style={{ marginTop: 12 }}>
        Verification also shows the previously stored hash and the time it was
        recorded for audit trails.
      </p>
    </div>
  );
}
