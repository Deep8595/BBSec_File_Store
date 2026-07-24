import { useState } from "react";
import { encryptFile, decryptFile } from "../services/api";

function formatPath(pathValue) {
  if (!pathValue) return "Not available";
  return pathValue.split(/[\\/]/).pop();
}

export default function CryptoCard({ fileInfo, onStatus }) {
  const [loading, setLoading] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState(null);

  async function handleEncrypt() {
    if (!fileInfo?.storedPath) {
      onStatus("Upload a file first");
      return;
    }

    setLoading(true);
    onStatus("Encrypting file...");

    try {
      const response = await encryptFile(fileInfo.storedPath);
      setCryptoInfo({
        mode: "encrypted",
        outputPath: response.outputPath,
        message: response.message || "Encryption completed",
        fileName: fileInfo?.fileName || "Unknown file",
      });
      onStatus(`Encrypted ${fileInfo?.fileName || "file"} successfully`);
    } catch (error) {
      onStatus(error.message || "Encryption failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecrypt() {
    if (!fileInfo?.storedPath) {
      onStatus("Upload a file first");
      return;
    }

    setLoading(true);
    onStatus("Decrypting file...");

    try {
      const response = await decryptFile(fileInfo.storedPath);
      setCryptoInfo({
        mode: "decrypted",
        outputPath: response.outputPath,
        message: response.message || "Decryption completed",
        fileName: fileInfo?.fileName || "Unknown file",
      });
      onStatus(
        response.message ||
          `Decrypted ${fileInfo?.fileName || "file"} successfully`,
      );
    } catch (error) {
      onStatus(
        error.response?.data?.message || error.message || "Decryption failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Encryption</h3>
        <span className="chip">Secure</span>
      </div>

      <div className="action-row">
        <button
          className="primary-btn"
          onClick={handleEncrypt}
          disabled={loading}
        >
          {loading ? "Working..." : "Encrypt"}
        </button>
        <button
          className="secondary-btn"
          onClick={handleDecrypt}
          disabled={loading}
        >
          Decrypt
        </button>
      </div>

      <div className="detail-list" style={{ marginTop: 16 }}>
        <div className="detail-item">
          <span className="field-label">Current file</span>
          <strong>{fileInfo?.fileName || "Upload a file first"}</strong>
        </div>
        <div className="detail-item">
          <span className="field-label">Last action</span>
          <strong>{cryptoInfo?.message || "No encryption activity yet"}</strong>
        </div>
        <div className="detail-item">
          <span className="field-label">Output file</span>
          <strong>{formatPath(cryptoInfo?.outputPath)}</strong>
        </div>
      </div>

      <p className="field-label" style={{ marginTop: 12 }}>
        Encryption uses a default AES-256 workflow and keeps the output location
        visible for quick access.
      </p>
    </div>
  );
}
