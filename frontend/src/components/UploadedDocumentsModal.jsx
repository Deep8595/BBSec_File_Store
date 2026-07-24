import { useEffect, useState } from "react";
import { getUploadedDocuments } from "../services/api";

export default function UploadedDocumentsModal({ open, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    async function loadDocuments() {
      setLoading(true);
      setError("");

      try {
        const response = await getUploadedDocuments();
        if (isMounted) {
          setDocuments(response.documents || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load documents");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDocuments();
    return () => {
      isMounted = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="card-header">
          <h3>Uploaded documents</h3>
          <button className="secondary-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {loading && <p>Loading uploaded documents...</p>}
        {error && <p className="field-label">{error}</p>}

        {!loading && !error && documents.length === 0 && (
          <p className="field-label">No uploaded documents yet.</p>
        )}

        <div className="status-list">
          {documents.map((document) => (
            <div key={document.name} className="status-item">
              <div style={{ flex: 1 }}>
                <strong>{document.name}</strong>
                <div className="field-label">
                  {Math.round(document.size / 1024)} KB •{" "}
                  {new Date(document.uploadedAt).toLocaleString()}
                </div>
              </div>
              <a
                href={`http://localhost:5000/${document.url}`}
                target="_blank"
                rel="noreferrer"
                className="primary-btn"
                style={{ textDecoration: "none", display: "inline-flex" }}
              >
                Open
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
