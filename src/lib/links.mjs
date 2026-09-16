export const adresseText = (b) => `${b.adresse.strasse}, ${b.adresse.plz} ${b.adresse.ort}`;

const q = (s) => encodeURIComponent(s);

export const mapsSuche = (adresse) => `https://www.google.com/maps/search/?api=1&query=${q(adresse)}`;
export const mapsRoute = (adresse) => `https://www.google.com/maps/dir/?api=1&destination=${q(adresse)}`;
// Only loaded after the visitor clicks "Karte laden" (two-click solution).
export const mapsEmbed = (adresse) => `https://www.google.com/maps?q=${q(adresse)}&output=embed`;

export const telLink = (b) => `tel:${b.telefon.e164}`;
