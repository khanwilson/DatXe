import polyline from '@mapbox/polyline';

export interface Bounds {
  ne: [number, number];
  sw: [number, number];
}

export const decodePolyline = (encodedPolyline: string): [number, number][] => {
  // Handle edge cases where encodedPolyline is null, undefined, or empty
  if (!encodedPolyline || typeof encodedPolyline !== 'string' || encodedPolyline.length === 0) {
    return [];
  }

  try {
    const decoded = polyline.decode(encodedPolyline);
    // Ensure decoded is an array before mapping
    if (!Array.isArray(decoded)) {
      return [];
    }
    return decoded.map(([lat, lng]) => [lng, lat]);
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
};

export const getBounds = (coordinates: [number, number][]): Bounds => {
  if (coordinates.length === 0) {
    return {
      ne: [0, 0],
      sw: [0, 0],
    };
  }

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return {
    ne: [maxLng, maxLat],
    sw: [minLng, minLat],
  };
};
