import { useState } from "react";
import { generateHash } from "../services/api";

export default function HashCard({ fileInfo, onStatus, onHashReady }) {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!fileInfo?.storedPath) {
      onStatus("Upload a file first");
      return;
    }

    setLoading(true);
    onStatus("Generating SHA-256 hash...");

    try {
      const response = await generateHash(fileInfo.storedPath);
      setHash(response.hash);
      onHashReady(response.hash);
      onStatus("Hash generated successfully");
    } catch (error) {
      onStatus(error.message || "Hash generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>SHA-256 Hash</h3>
        <span className="chip">Integrity</span>
      </div>

      <label className="field-label" htmlFor="hash-output">
        Generated hash
      </label>
      <textarea
        id="hash-output"
        rows="5"
        readOnly
        placeholder="Hash will be displayed here..."
        value={hash}
      />

      <div className="action-row">
        <button
          className="primary-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Hash"}
        </button>
      </div>
    </div>
  );
}
