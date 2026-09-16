import menu from '../data/menu.json';

export const kategorien = menu.kategorien;

export const kategorie = (id) => kategorien.find((k) => k.id === id);

// Lowest price in a category, used for the "ab" prices on the homepage.
export const abPreis = (id) => Math.min(...kategorie(id).artikel.flatMap((a) => a.preise.map((p) => p.preis)));

// If every item in a category has the same variant labels (e.g. pizza sizes), return them as column headers.
export function spalten(k) {
  const first = k.artikel[0].preise.map((p) => p.label);
  if (first.length < 2) return null;
  const same = k.artikel.every((a) => a.preise.map((p) => p.label).join('|') === first.join('|'));
  return same ? first : null;
}

export const hatAllergendaten = kategorien.some((k) =>
  k.artikel.some((a) => a.allergene.length > 0 || a.zusatzstoffe.length > 0),
);
