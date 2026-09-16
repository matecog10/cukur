export const NBSP = ' ';

export const preis = (n) => `${n.toFixed(2).replace('.', ',')}${NBSP}€`;

export const zeitraum = (von, bis) => `${von}${NBSP}bis ${bis}${NBSP}Uhr`;

const KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const tagesText = (t) => (t.zeiten.length ? t.zeiten.map((z) => zeitraum(z.von, z.bis)).join(', ') : 'Ruhetag');

// Groups consecutive weekdays with identical hours: [{ tage: "Mo bis Fr", text: "11:00 bis 21:30 Uhr" }]
export function kompakteZeiten(plan) {
  const texte = plan.map(tagesText);
  if (texte.every((t) => t === texte[0])) return [{ tage: 'Täglich', text: texte[0] }];
  const gruppen = [];
  texte.forEach((text, i) => {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.text === text) letzte.ende = i;
    else gruppen.push({ start: i, ende: i, text });
  });
  return gruppen.map((g) => ({
    tage: g.start === g.ende ? KURZ[g.start] : `${KURZ[g.start]} bis ${KURZ[g.ende]}`,
    text: g.text,
  }));
}

export const kompakteZeitenText = (plan) =>
  kompakteZeiten(plan)
    .map((z) => `${z.tage} ${z.text}`)
    .join(', ');
