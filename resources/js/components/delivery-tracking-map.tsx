import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryTrackingMapProps {
  deliveryLocation?: { lat: number | string | null; lng: number | string | null; address: string };
  currentLocation?: { lat: number | string | null; lng: number | string | null };
  pickupLocation?: { lat: number | string | null; lng: number | string | null; address: string };
  isDelivered?: boolean;
  className?: string;
}

// Component to update map view when location changes
function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function DeliveryTrackingMap({
  deliveryLocation,
  currentLocation,
  pickupLocation,
  isDelivered = false,
  className = "h-96 w-full"
}: DeliveryTrackingMapProps) {
  const [center, setCenter] = useState<LatLngExpression>([14.5995, 120.9842]); // Manila default
  const [zoom, setZoom] = useState(13);

  // Custom icons
  const deliveryIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const currentIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const pickupIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (deliveryLocation && deliveryLocation.lat != null && deliveryLocation.lng != null) {
      setCenter([Number(deliveryLocation.lat), Number(deliveryLocation.lng)]);
      setZoom(15);
    } else if (currentLocation && currentLocation.lat != null && currentLocation.lng != null) {
      setCenter([Number(currentLocation.lat), Number(currentLocation.lng)]);
      setZoom(15);
    }
  }, [deliveryLocation, currentLocation]);

  const routeCoordinates: LatLngExpression[] = [];
  
  if (pickupLocation && pickupLocation.lat != null && pickupLocation.lng != null) {
    routeCoordinates.push([Number(pickupLocation.lat), Number(pickupLocation.lng)]);
  }
  
  if (currentLocation && currentLocation.lat != null && currentLocation.lng != null) {
    routeCoordinates.push([Number(currentLocation.lat), Number(currentLocation.lng)]);
  }
  
  if (deliveryLocation && deliveryLocation.lat != null && deliveryLocation.lng != null) {
    routeCoordinates.push([Number(deliveryLocation.lat), Number(deliveryLocation.lng)]);
  }

  return (
    <div className={className} style={{ zIndex: 0, position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0, position: 'relative' }}
        className="rounded-lg"
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Location */}
        {pickupLocation && pickupLocation.lat != null && pickupLocation.lng != null && (
          <Marker 
            position={[Number(pickupLocation.lat), Number(pickupLocation.lng)]} 
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Pickup Location</strong>
                <br />
                {pickupLocation.address}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current Delivery Location */}
        {currentLocation && currentLocation.lat != null && currentLocation.lng != null && !isDelivered && (
          <Marker 
            position={[Number(currentLocation.lat), Number(currentLocation.lng)]} 
            icon={currentIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Current Location</strong>
                <br />
                Tank is on the way!
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Location */}
        {deliveryLocation && deliveryLocation.lat != null && deliveryLocation.lng != null && (
          <Marker 
            position={[Number(deliveryLocation.lat), Number(deliveryLocation.lng)]} 
            icon={deliveryIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{isDelivered ? 'Delivered' : 'Delivery Location'}</strong>
                <br />
                {deliveryLocation.address}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray={isDelivered ? undefined : "10, 10"}
          />
        )}
      </MapContainer>
    </div>
  );
}
