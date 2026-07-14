// Star-chart names for the constellations. An entry's own `name` field wins;
// otherwise a saved edit from admin mode (localStorage) wins; otherwise a
// random Latin-ish name is generated for the session.

const STORAGE_KEY = "constellation-names";

const FIRST = [
  "VELA",
  "CORVA",
  "NOCTUA",
  "PYXIS",
  "VESPERA",
  "CAELIA",
  "FILUM",
  "ACUS",
  "MIRA",
  "THALIA",
  "SUTURA",
  "CHARTA",
  "LUMEN",
  "ANSER",
  "CARDO",
];

const SECOND = [
  "MINOR",
  "MAJOR",
  "BOREALIS",
  "AUSTRALIS",
  "ERRANS",
  "SERENA",
  "PARVA",
  "NOVA",
  "OBSCURA",
  "TENUIS",
  "RUBRA",
  "OCCASUS",
];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function loadNames(entries) {
  const saved = readSaved();
  const used = new Set(Object.values(saved));
  const names = {};
  for (const entry of entries) {
    if (entry.name) {
      names[entry.id] = entry.name;
      continue;
    }
    if (saved[entry.id]) {
      names[entry.id] = saved[entry.id];
      continue;
    }
    let candidate;
    do {
      candidate =
        FIRST[Math.floor(Math.random() * FIRST.length)] +
        " " +
        SECOND[Math.floor(Math.random() * SECOND.length)];
    } while (used.has(candidate));
    used.add(candidate);
    names[entry.id] = candidate;
  }
  return names;
}

export function saveName(id, name) {
  const saved = readSaved();
  saved[id] = name;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}
