import { NodeItem } from "@/type";

export interface Coordinates {
  lat: number;
  lng: number;
}

export const getValidGraveLocations = (profiles: NodeItem[]): (NodeItem & { coords: Coordinates })[] => {
  return profiles
    .filter(profile => profile.burialLocationLink)
    .map(profile => {
      // Extract coordinates from Google Maps link
      // Format: https://www.google.com/maps?q=lat,lng or similar
      const coords = extractCoordinatesFromLink(profile.burialLocationLink || '');
      return {
        ...profile,
        coords
      };
    })
    .filter(profile => profile.coords.lat !== 0 && profile.coords.lng !== 0);
};

export const createCustomMarkerIcon = (isAlive: boolean): google.maps.Symbol => {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: isAlive ? "#10b981" : "#6b7280",
    fillOpacity: 0.8,
    strokeWeight: 2,
    strokeColor: "#ffffff"
  };
};

const extractCoordinatesFromLink = (link: string): Coordinates => {
  try {
    // Try to extract coordinates from various Google Maps URL formats
    const url = new URL(link);
    
    // Check for @lat,lng format
    const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Check for query parameter format
    const qParam = url.searchParams.get('q');
    if (qParam) {
      const coords = qParam.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return {
          lat: coords[0],
          lng: coords[1]
        };
      }
    }
    
    // Check for place format
    const placeParam = url.searchParams.get('place');
    if (placeParam) {
      const match = placeParam.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse coordinates from link:', link);
  }
  
  return { lat: 0, lng: 0 };
};
