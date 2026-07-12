import { useEffect } from "react";

// Expanded panel for a single entry. `entry.media` is reserved for later —
// when it's non-null, render it in the media slot below.
export default function ContentCard({ entry, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!entry) return null;

  return (
    <div className="card-backdrop" onClick={onClose}>
      <div
        className="card"
        role="dialog"
        aria-modal="true"
        aria-label={entry.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="card-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="card-date">{entry.date}</p>
        <h2 className="card-title">{entry.title}</h2>
        {entry.media && (
          <div className="card-media">
            {/* future: render entry.media here (image / video / embed) */}
          </div>
        )}
        <p className="card-description">{entry.description}</p>
      </div>
    </div>
  );
}
