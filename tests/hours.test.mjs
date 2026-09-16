import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oeffnungsstatus, statusText, jetztInZeitzone } from '../src/lib/hours.mjs';

const NB = ' ';
const t = (h, m = 0) => h * 60 + m;
const woche = (fn) => Array.from({ length: 7 }, (_, i) => ({ tag: String(i), zeiten: fn(i) }));
const text = (plan, day, min) => statusText(oeffnungsstatus(plan, day, min));

const taeglich = woche(() => [{ von: '11:00', bis: '21:30' }]);

test('geöffnet', () => {
  assert.equal(text(taeglich, 0, t(12)), `Jetzt geöffnet, bis 21:30${NB}Uhr`);
});

test('geschlossen vor Öffnung', () => {
  assert.equal(text(taeglich, 0, t(9)), `Geschlossen, öffnet heute um 11:00${NB}Uhr`);
});

test('geschlossen nach Schluss', () => {
  assert.equal(text(taeglich, 0, t(22)), `Geschlossen, öffnet Dienstag um 11:00${NB}Uhr`);
  assert.equal(text(taeglich, 0, t(21, 30)), `Geschlossen, öffnet Dienstag um 11:00${NB}Uhr`);
  assert.equal(text(taeglich, 6, t(23)), `Geschlossen, öffnet Montag um 11:00${NB}Uhr`);
});

test('Ruhetag', () => {
  const plan = woche((i) => (i === 1 ? [] : [{ von: '11:00', bis: '21:30' }]));
  assert.equal(text(plan, 0, t(22)), `Geschlossen, öffnet Mittwoch um 11:00${NB}Uhr`);
  assert.equal(text(plan, 1, t(12)), `Geschlossen, öffnet Mittwoch um 11:00${NB}Uhr`);
});

test('Schluss nach Mitternacht', () => {
  const plan = woche(() => [{ von: '11:00', bis: '01:00' }]);
  assert.equal(text(plan, 0, t(23, 59)), `Jetzt geöffnet, bis 01:00${NB}Uhr`);
  assert.equal(text(plan, 1, t(0, 30)), `Jetzt geöffnet, bis 01:00${NB}Uhr`);
  assert.equal(text(plan, 1, t(1, 30)), `Geschlossen, öffnet heute um 11:00${NB}Uhr`);
});

test('nach Mitternacht am Tag nach Öffnung, heute Ruhetag', () => {
  const plan = woche((i) => (i === 0 ? [] : [{ von: '11:00', bis: '01:00' }]));
  assert.equal(text(plan, 0, t(0, 30)), `Jetzt geöffnet, bis 01:00${NB}Uhr`);
  assert.equal(text(plan, 0, t(2)), `Geschlossen, öffnet Dienstag um 11:00${NB}Uhr`);
});

test('nur ein Tag pro Woche geöffnet, heute schon vorbei', () => {
  const plan = woche((i) => (i === 2 ? [{ von: '11:00', bis: '14:00' }] : []));
  assert.equal(text(plan, 2, t(15)), `Geschlossen, öffnet Mittwoch um 11:00${NB}Uhr`);
});

test('Zeitzone Europe/Vienna, Sommer- und Winterzeit', () => {
  assert.deepEqual(jetztInZeitzone('Europe/Vienna', new Date('2026-09-15T10:00:00Z')), { day: 1, minutes: 720 });
  assert.deepEqual(jetztInZeitzone('Europe/Vienna', new Date('2026-12-20T22:30:00Z')), { day: 6, minutes: 1410 });
});
