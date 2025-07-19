"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCompanies } from "@/lib/queries";

// Add prop for map click callback
interface CompanyMapProps {
  onMapClick?: (lat: number, lng: number) => void;
}

// Map click handler component
const MapClickHandler = ({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const CompanyMap = ({ onMapClick }: CompanyMapProps) => {
  const { data: companies = [], isLoading: loading, error } = useCompanies();

  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load companies</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={2}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Add map click handler */}
      <MapClickHandler onMapClick={onMapClick} />
      {companies.map((company) => (
        <Marker
          key={company.id}
          position={[company.latitude, company.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-lg">{company.name}</strong>
              {company.industry && (
                <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
              )}
              {company.address && (
                <p className="text-sm text-gray-500 mt-1">{company.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default CompanyMap;
