export type NearbyCareType = 'doctor' | 'hospital' | 'emergency';

export interface NearbyCarePlace {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openInMapsUrl: string;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildOverpassQuery(lat: number, lng: number, radiusMeters: number, careType: NearbyCareType): string {
  const isHospitalOnly = careType === 'hospital' || careType === 'emergency';
  const nodes = isHospitalOnly
    ? `
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
    `
    : `
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
      relation["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
    `;

  return `
    [out:json][timeout:25];
    (
      ${nodes}
    );
    out center tags;
  `;
}

export async function findNearbyCare(
  lat: number,
  lng: number,
  careType: NearbyCareType,
  radiusMeters = 7000
): Promise<NearbyCarePlace[]> {
  const query = buildOverpassQuery(lat, lng, radiusMeters, careType);
  const endpoint = 'https://overpass-api.de/api/interpreter';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    elements?: Array<{
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string | undefined>;
    }>;
  };

  const places = (json.elements ?? [])
    .map<NearbyCarePlace | null>((el) => {
      const latitude = el.lat ?? el.center?.lat;
      const longitude = el.lon ?? el.center?.lon;
      if (latitude == null || longitude == null) return null;

      const tags = el.tags ?? {};
      const amenity = tags['amenity'];
      const healthcare = tags['healthcare'];
      const rawType = healthcare ?? amenity ?? 'care-center';
      const type = rawType === 'doctor' ? 'doctor' : rawType;
      const name = tags['name'] ?? `Nearby ${type}`;
      const address = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || undefined;
      const phone = tags['phone'] ?? tags['contact:phone'] ?? undefined;
      const email = tags['email'] ?? tags['contact:email'] ?? undefined;
      const website = tags['website'] ?? tags['contact:website'] ?? undefined;
      const distanceKm = haversineKm(lat, lng, latitude, longitude);

      const place: NearbyCarePlace = {
        name,
        type,
        latitude,
        longitude,
        distanceKm: Number(distanceKm.toFixed(2)),
        address,
        phone,
        email,
        website,
        openInMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      };

      return place;
    })
    .filter((x): x is NearbyCarePlace => Boolean(x))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);

  return places;
}

