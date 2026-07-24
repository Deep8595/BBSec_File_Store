import { useState } from "react";
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
import HashCard from "../components/HashCard";
import CryptoCard from "../components/CryptoCard";
import BlockchainCard from "../components/BlockchainCard";
import StatusCard from "../components/StatusCard";
import UploadedDocumentsModal from "../components/UploadedDocumentsModal";
import FeatureHighlights from "../components/FeatureHighlights";

export default function Dashboard() {
  const [status, setStatus] = useState("Ready to upload a file");
  const [fileInfo, setFileInfo] = useState(null);
  const [hashValue, setHashValue] = useState("");
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem("bbsec-current-user") || "null");
    } catch {
      return null;
    }
  });

  function handleLogin(user) {
    setCurrentUser(user);
    sessionStorage.setItem("bbsec-current-user", JSON.stringify(user));
    setStatus(`Welcome ${user.name || user.email}`);
  }

  function handleLogout() {
    setCurrentUser(null);
    sessionStorage.removeItem("bbsec-current-user");
    setStatus("Signed out");
  }

  return (
    <div className="app-shell">
      <Navbar
        fileInfo={fileInfo}
        hashValue={hashValue}
        onOpenDocuments={() => setShowDocumentsModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        currentUser={currentUser}
      />

      <main className="main-content">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Secure file storage</p>
            <h1>Protect your files with blockchain-backed hashing.</h1>
            <p className="hero-text">
              Upload, encrypt, and verify your documents through a streamlined
              experience designed for clarity and trust.
            </p>
          </div>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Live blockchain verification ready
          </div>
        </section>

        <section className="grid">
          <FeatureHighlights />
          <FileUploader onStatus={setStatus} onFileReady={setFileInfo} />
          <HashCard
            fileInfo={fileInfo}
            onStatus={setStatus}
            onHashReady={setHashValue}
          />
          <CryptoCard fileInfo={fileInfo} onStatus={setStatus} />
          <BlockchainCard
            fileInfo={fileInfo}
            hashValue={hashValue}
            onStatus={setStatus}
          />
          <StatusCard
            status={status}
            fileInfo={fileInfo}
            hashValue={hashValue}
          />
        </section>
      </main>

      <UploadedDocumentsModal
        open={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
      />

      {showAuthModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card auth-modal-card">
            <div className="card-header">
              <h3>Account access</h3>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => setShowAuthModal(false)}
              >
                Close
              </button>
            </div>
            <AuthPanel
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onOpenAuth={setShowAuthModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
