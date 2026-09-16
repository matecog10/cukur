# Website Çukur

Statische Website für Çukur, Wallensteinplatz 3-4, 1200 Wien. Gebaut mit Astro, ohne Client-Framework, ohne Tracking.

## Starten

Voraussetzung: Node.js 20 oder neuer.

```sh
npm install
npm run dev        # lokale Vorschau auf http://localhost:4321
npm test           # testet die Logik für "Jetzt geöffnet / Geschlossen"
npm run build      # erzeugt die fertige Seite im Ordner dist/
npm run preview    # zeigt den Build lokal an
npm run icons      # erzeugt PNG-Icons und favicon.ico neu aus public/favicon.svg
```

## Veröffentlichen

Der Ordner `dist/` ist die komplette Website und kann auf jeden statischen Hoster (zum Beispiel Netlify, Cloudflare Pages oder einen Webspace in Österreich).

Vor dem Build die echte Domain setzen, sonst stehen falsche Adressen in Canonical-Tags, Sitemap und strukturierten Daten:

```sh
SITE_URL=https://www.deine-domain.at npm run build
```

Bei Netlify oder Cloudflare Pages: Build-Befehl `npm run build`, Ausgabeordner `dist`, Umgebungsvariable `SITE_URL`.

Den Hosting-Anbieter danach in `src/data/betrieb.json` unter `hosting` eintragen (erscheint in der Datenschutzerklärung).

## Inhalte ändern

Alle Fakten stehen in zwei Dateien. Sonst muss nichts angefasst werden.

### `src/data/betrieb.json`: Adresse, Telefon, Öffnungszeiten, Rechtliches

- `oeffnungszeiten`: sieben Einträge von Montag bis Sonntag. Ruhetag: `"zeiten": []`. Schluss nach Mitternacht funktioniert, zum Beispiel `{ "von": "11:00", "bis": "01:00" }`. Zwei Zeiträume an einem Tag: zwei Einträge in `zeiten`.
- `bezahlen`: zum Beispiel `["Bar", "Bankomatkarte"]`. Leer lassen blendet den Block aus.
- `bestellen.telefonisch`: `true` zeigt „Bestellen unter ...“ auf der Startseite.
- `inhaber`, `rechtsform`, `email`, `uid`, `firmenbuch`, `hosting`: werden in Impressum, Datenschutz und Footer eingesetzt. Solange sie leer sind, stehen dort rot markierte „fehlt noch“-Hinweise.

### `src/data/menu.json`: Speisekarte

Jede Kategorie hat `id` (Sprungmarke), `name`, `hinweis` (optional) und `artikel`. Jeder Artikel:

```json
{
  "name": "Hühner Döner",
  "beschreibung": "Hühnerfleisch, gemischter Salat, zwei Saucen nach Wahl, scharf",
  "preise": [{ "label": "", "preis": 6.0 }],
  "allergene": ["A", "G"],
  "zusatzstoffe": [],
  "vegetarisch": false,
  "vegan": false
}
```

- Preise als Zahl mit Punkt (`6.5`), die Seite zeigt daraus „6,50 €“.
- Größen: mehrere Einträge in `preise`, zum Beispiel `{ "label": "Klein", "preis": 5.0 }`. Haben alle Artikel einer Kategorie dieselben Größen (wie bei Pizza), erscheinen sie als Spalten.
- Die „ab“-Preise auf der Startseite werden automatisch aus dieser Datei berechnet.
- Allergene als Buchstaben A bis R, Zusatzstoffe als Zahlen 1 bis 12 (Legende in `src/lib/allergene.mjs`). Sobald ein Artikel Codes hat, zeigt die Seite `/allergene` automatisch die Legende.

## Fotos

Alle Bilder liegen in `src/assets/fotos/`. Ein Gericht bekommt ein Bild über das Feld `"foto"` in `menu.json`, der Wert ist der Dateiname ohne Endung:

```json
{ "name": "Diavolo", "foto": "diavolo", ... }
```

Das Bild erscheint dann automatisch als Vorschaubild auf der Speisekarte und im Laufband „Aus der Speisekarte“ auf der Startseite.

**Achtung, Symbolbilder:** Die aktuellen 13 Bilder stammen von Lieferando und sind dort als „nur zur Illustration“ markiert. Sie zeigen nicht die echten Gerichte von Çukur und sind deshalb überall als „Symbolbild“ gekennzeichnet. Echte Fotos einfach mit demselben Dateinamen ersetzen (zum Beispiel `diavolo.jpg`) und in `src/pages/index.astro` bzw. `src/pages/speisekarte.astro` die Kennzeichnung entfernen (`symbolbild` am `Photo`-Element, Hinweistexte „Symbolbilder“).

Astro erzeugt aus jedem Bild AVIF, WebP und JPEG in mehreren Breiten und entfernt dabei die EXIF-Daten inklusive Standort.

## Animationen

Angelehnt an die Empyre-Landingpage, ohne Bibliothek (`src/scripts/motion.js` und der Abschnitt „Header lift and hide“ in `src/styles/global.css`):

- Hero: Überschrift steigt mit Unschärfe ein, Adresse und Buttons folgen versetzt
- Header fährt beim Laden ein, verschwindet beim Runterscrollen und kommt beim Hochscrollen zurück
- Abschnitte und Karten erscheinen beim Scrollen (`data-reveal="up" | "left" | "blur" | "fade"`, Verzögerung über `style="--i: 1"`)
- „ab“-Preise laufen beim Erscheinen kurz durch (`data-scramble`)
- Laufband mit Gerichten, stoppt bei Mausberührung
- Blinkender Punkt neben dem Status, solange geöffnet

Ohne JavaScript ist alles sofort sichtbar. Bei „Bewegung reduzieren“ im Betriebssystem ist jede Animation aus und das Laufband wird zu einer normal scrollbaren Reihe.

## Aufbau

```
src/data/        betrieb.json, menu.json
src/lib/         Öffnungslogik, Formatierung, Links, JSON-LD
src/components/  Header, Footer, Öffnungszeiten, Karte (Zwei-Klick), Foto
src/pages/       Startseite, Speisekarte, Kontakt, Allergene, Impressum, Datenschutz, AGB, 404, sitemap.xml, robots.txt
src/scripts/     kleines Vanilla-JS: Navigation, Öffnungsstatus, Kategorieleiste, Karte
public/          Schriften (selbst gehostet), Favicons, Web-Manifest
tests/           Tests der Öffnungslogik
```
