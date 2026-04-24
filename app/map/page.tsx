"use client";

import React, { useState, useCallback, useRef } from "react";
import { Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { NodeItem } from "@/type";
import { getValidGraveLocations, createCustomMarkerIcon, Coordinates } from "@/utils/mapUtils";

interface MapPageProps {
  profiles?: NodeItem[];
}

const MapContent = ({ profiles = [] }: MapPageProps) => {
  const map = useMap();
  const [selectedGrave, setSelectedGrave] = useState<(NodeItem & { coords: Coordinates }) | null>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const validGraves = getValidGraveLocations(profiles);

  const createClusterer = useCallback(() => {
    if (!map) return null;

    const clusterer = new MarkerClusterer({
      map,
      markers: [],
      renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            label: {
              text: String(count),
              color: "white",
              fontSize: "12px",
              fontWeight: "bold"
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: Math.min(count * 2, 30),
              fillColor: "#3b82f6",
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: "#ffffff"
            }
          });
        }
      }
    });

    return clusterer;
  }, [map]);

  React.useEffect(() => {
    if (!map) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    const clusterer = createClusterer();
    if (!clusterer) return;

    clustererRef.current = clusterer;

    const markers = validGraves.map((grave) => {
      const marker = new google.maps.Marker({
        position: grave.coords,
        icon: createCustomMarkerIcon(grave.isAlive),
        title: grave.name
      });

      marker.addListener("click", () => {
        setSelectedGrave(grave);
        setInfoWindowShown(true);
      });

      return marker;
    });

    clusterer.addMarkers(markers);

    return () => {
      clusterer.clearMarkers();
    };
  }, [map, validGraves, createClusterer]);

  const handleCloseInfoWindow = () => {
    setInfoWindowShown(false);
    setSelectedGrave(null);
  };

  return (
    <>
      {validGraves.map((grave) => (
        <AdvancedMarker
          key={grave.id}
          position={grave.coords}
          onClick={() => {
            setSelectedGrave(grave);
            setInfoWindowShown(true);
          }}
        >
          <div className="relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={grave.isAlive ? "text-green-400" : "text-gray-500"}
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            {!grave.isAlive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            )}
          </div>
        </AdvancedMarker>
      ))}

      {infoWindowShown && selectedGrave && (
        <InfoWindow
          position={selectedGrave.coords}
          onCloseClick={handleCloseInfoWindow}
        >
          <div className="p-3 max-w-xs">
            <h3 className="font-bold text-lg mb-2">{selectedGrave.name}</h3>
            <div className="space-y-1 text-sm">
              {selectedGrave.deathday && (
                <p>
                  <span className="font-semibold">Ngày mất:</span> {selectedGrave.deathday}
                </p>
              )}
              {selectedGrave.burialLocation && (
                <p>
                  <span className="font-semibold">Nghĩa trang:</span> {selectedGrave.burialLocation}
                </p>
              )}
              {selectedGrave.note && (
                <p>
                  <span className="font-semibold">Ghi chú:</span> {selectedGrave.note}
                </p>
              )}
            </div>
            {selectedGrave.burialLocationLink && (
              <button
                onClick={() => window.open(selectedGrave.burialLocationLink, "_blank")}
                className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Xem trên Google Maps
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapPage: React.FC<MapPageProps> = ({ profiles }) => {
  const validGraves = getValidGraveLocations(profiles || []);

  const defaultCenter = validGraves.length > 0
    ? {
        lat: validGraves.reduce((sum, grave) => sum + grave.coords.lat, 0) / validGraves.length,
        lng: validGraves.reduce((sum, grave) => sum + grave.coords.lng, 0) / validGraves.length
      }
    : { lat: 10.8231, lng: 106.6297 }; // TP.HCM

  return (
    <div className="h-full w-full">
      <Map
        defaultZoom={validGraves.length > 0 ? 12 : 8}
        defaultCenter={defaultCenter}
        mapId="grave_map"
        className="h-full w-full"
        gestureHandling="auto"
        clickableIcons={false}
      >
        <MapContent profiles={profiles} />
      </Map>
    </div>
  );
};

export default MapPage;
