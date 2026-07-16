// One entry (about me / a blog post) as its own page, reached via #/<id>.
export default function EntryPage({ entry }) {
  return (
    <main className="entry-page">
      <a className="entry-back" href="#/">
        &larr; back
      </a>
      <h1 className="entry-title">{entry.title}</h1>
      {entry.date && <div className="entry-date">{entry.date}</div>}
      <p className="entry-body">{entry.description}</p>
    </main>
  );
}
