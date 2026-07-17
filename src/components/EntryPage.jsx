// Split a string into text and clickable links, so bare URLs in an entry's
// description render as anchors (line breaks are preserved via CSS).
function linkify(text) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        className="entry-body-link"
        href={part}
        target="_blank"
        rel="noreferrer"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

// One entry (about me / a blog post) as its own page, reached via #/<id>.
export default function EntryPage({ entry }) {
  return (
    <main className="entry-page">
      <a className="entry-back" href="#">
        &larr; back
      </a>
      <h1 className="entry-title">{entry.title}</h1>
      {entry.date && <div className="entry-date">{entry.date}</div>}
      <p className="entry-body">{linkify(entry.description)}</p>
    </main>
  );
}
