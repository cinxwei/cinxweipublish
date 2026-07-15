// Star-chart names for the constellations. Constellations are unnamed by
// default — a label only appears once one is given in admin mode, and those
// edits live in localStorage. Saving an empty name un-names it again.

const STORAGE_KEY = "constellation-names";

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function loadNames(entries) {
  const saved = readSaved();
  const names = {};
  for (const entry of entries) {
    if (saved[entry.id] != null) names[entry.id] = saved[entry.id];
    else if (entry.name) names[entry.id] = entry.name;
  }
  return names;
}

export function saveName(id, name) {
  const saved = readSaved();
  saved[id] = name;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}
