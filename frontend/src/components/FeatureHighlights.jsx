export default function FeatureHighlights() {
  const features = [
    {
      title: "Immutable audit trail",
      description: "Every hash is stored with a timestamp for tamper evidence.",
    },
    {
      title: "Encrypted workflows",
      description:
        "Protect files with secure encryption before sharing or verification.",
    },
    {
      title: "Secure access",
      description:
        "A lightweight login and signup flow keeps the workspace personal.",
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3>More platform features</h3>
        <span className="chip">Improved</span>
      </div>
      <div className="detail-list">
        {features.map((feature) => (
          <div key={feature.title} className="detail-item">
            <strong>{feature.title}</strong>
            <span className="field-label">{feature.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
