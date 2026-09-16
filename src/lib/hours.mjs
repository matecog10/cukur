// Opening-status logic. Pure functions so they can be unit tested (tests/hours.test.mjs).
// plan: array of 7 days, index 0 = Montag ... 6 = Sonntag, each { tag, zeiten: [{ von: "HH:MM", bis: "HH:MM" }] }.
// A range whose "bis" is earlier than or equal to "von" closes after midnight (e.g. 11:00 bis 01:00).

export const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const NBSP = ' ';

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function oeffnungsstatus(plan, day, minutes) {
  // Yesterday's ranges that run past midnight.
  for (const z of plan[(day + 6) % 7].zeiten) {
    if (toMin(z.bis) <= toMin(z.von) && minutes < toMin(z.bis)) return { offen: true, bis: z.bis };
  }
  for (const z of plan[day].zeiten) {
    const von = toMin(z.von);
    const bis = toMin(z.bis);
    const ende = bis <= von ? 24 * 60 + bis : bis;
    if (minutes >= von && minutes < ende) return { offen: true, bis: z.bis };
  }
  // Next opening, up to the same weekday next week.
  for (let i = 0; i <= 7; i++) {
    const d = (day + i) % 7;
    const starts = plan[d].zeiten
      .map((z) => z.von)
      .filter((von) => i > 0 || toMin(von) > minutes)
      .sort((a, b) => toMin(a) - toMin(b));
    if (starts.length) return { offen: false, heute: i === 0, tag: d, um: starts[0] };
  }
  return { offen: false };
}

export function statusText(s) {
  if (s.offen) return `Jetzt geöffnet, bis ${s.bis}${NBSP}Uhr`;
  if (!s.um) return 'Derzeit geschlossen';
  if (s.heute) return `Geschlossen, öffnet heute um ${s.um}${NBSP}Uhr`;
  return `Geschlossen, öffnet ${WOCHENTAGE[s.tag]} um ${s.um}${NBSP}Uhr`;
}

export function jetztInZeitzone(timeZone, date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
