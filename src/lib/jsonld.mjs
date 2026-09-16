const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function restaurantJsonLd(b, site) {
  const groups = new Map();
  b.oeffnungszeiten.forEach((t, i) =>
    t.zeiten.forEach((z) => {
      const key = `${z.von}|${z.bis}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(`https://schema.org/${DAYS[i]}`);
    }),
  );

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: b.name,
    url: new URL('/', site).href,
    telephone: b.telefon.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.adresse.strasse,
      postalCode: b.adresse.plz,
      addressLocality: b.adresse.ort,
      addressCountry: b.adresse.land,
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    openingHoursSpecification: [...groups].map(([key, dayOfWeek]) => {
      const [opens, closes] = key.split('|');
      return { '@type': 'OpeningHoursSpecification', dayOfWeek, opens, closes };
    }),
    servesCuisine: ['Türkisch', 'Pizza'],
    priceRange: b.preisspanne,
    hasMenu: new URL('/speisekarte/', site).href,
  };
  if (b.email) data.email = b.email;
  return data;
}
