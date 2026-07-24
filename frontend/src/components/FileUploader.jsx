import { useState } from "react";
import { uploadFile } from "../services/api";

export default function FileUploader({ onStatus, onFileReady }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadToGoogle, setUploadToGoogle] = useState(false);

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    onStatus("Uploading file...");

    try {
      const response = await uploadFile(file, { uploadToGoogle });
      onStatus(
        response.googleDrive?.webViewLink
          ? `Uploaded and synced to Google Drive`
          : `Uploaded ${response.fileName}`,
      );
      onFileReady(response);
    } catch (error) {
      onStatus(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Select File</h3>
        <span className="chip">Upload</span>
      </div>

      <label className="upload-box" htmlFor="file-upload">
        <div className="upload-icon">⬆</div>
        <strong>
          {selectedFile ? selectedFile.name : "Drop or choose a file"}
        </strong>
        <span>
          {loading ? "Uploading..." : "Supports secure document uploads"}
        </span>
        <input id="file-upload" type="file" onChange={handleChange} />
      </label>

      <label className="field-label" style={{ marginTop: 12 }}>
        <input
          type="checkbox"
          checked={uploadToGoogle}
          onChange={(event) => setUploadToGoogle(event.target.checked)}
        />{" "}
        Upload to Google Drive (requires service account setup)
      </label>
    </div>
  );
}
