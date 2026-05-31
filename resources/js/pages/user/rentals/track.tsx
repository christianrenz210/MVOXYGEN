import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, MapPin, Clock, CheckCircle, Truck, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState, useEffect } from 'react';
import DeliveryTrackingMap from '@/components/delivery-tracking-map';

interface Props {
  breadcrumbs?: BreadcrumbItem[];
  rental?: {
    id: number;
    tank_type: string;
    status: string;
    pickup_type: string;
    created_at: string;
    tracking_number?: string;
    delivery_location?: {
      lat: number;
      lng: number;
      address: string;
    };
    pickup_location?: {
      lat: number;
      lng: number;
      address: string;
    };
    current_location?: {
      lat: number;
      lng: number;
    };
  };
}

export default function RentalTracking({ 
  breadcrumbs = [{ title: 'Dashboard', href: '/user/dashboard' }],
  rental 
}: Props) {
  // Generate a mock location based on delivery location if no current location is provided
  const getMockCurrentLocation = () => {
    if (rental?.current_location) return rental.current_location;
    
    // If no real location but in transit, generate a fake one slightly offset
    if (rental?.status === 'in_transit' && rental.delivery_location?.lat != null) {
      // Fake offset roughly a few blocks away
      return {
        lat: Number(rental.delivery_location.lat) - 0.005,
        lng: Number(rental.delivery_location.lng) - 0.005
      };
    }
    return undefined;
  };

  const [currentLocation, setCurrentLocation] = useState(getMockCurrentLocation());
  const [isDelivered, setIsDelivered] = useState(rental?.status === 'delivered');

  // Simulate real-time location updates (in production, this would use WebSocket or polling)
  useEffect(() => {
    if (rental?.status === 'in_transit' && !isDelivered) {
      const interval = setInterval(() => {
        // Simulate movement - in real app, this would fetch from API
        router.get(`/user/rentals/${rental.id}/track`, {}, {
          preserveState: true,
          onSuccess: (page) => {
            const updatedRental = page.props.rental as any;
            if (updatedRental) {
              if (updatedRental.current_location) {
                setCurrentLocation(updatedRental.current_location);
              } else if (updatedRental.status === 'in_transit' && updatedRental.delivery_location?.lat != null) {
                // Simulate moving closer (random jitter)
                setCurrentLocation(prev => {
                  if (!prev) return getMockCurrentLocation();
                  
                  const targetLat = Number(updatedRental.delivery_location.lat);
                  const targetLng = Number(updatedRental.delivery_location.lng);
                  
                  // Move 20% closer to destination every update
                  return {
                    lat: Number(prev.lat) + (targetLat - Number(prev.lat)) * 0.2,
                    lng: Number(prev.lng) + (targetLng - Number(prev.lng)) * 0.2
                  };
                });
              }
              setIsDelivered(updatedRental.status === 'delivered');
            }
          }
        });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [rental?.id, rental?.status, isDelivered]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved - Preparing Delivery';
      case 'in_transit':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered Successfully';
      default:
        return status;
    }
  };

  const breadcrumbsWithTrack: BreadcrumbItem[] = [
    ...breadcrumbs,
    { title: 'Track Delivery', href: `/user/rentals/${rental?.id}/track` }
  ];

  if (!rental) {
    return (
      <AppLayout>
        <Head title="Rental Not Found" />
        <div className="min-h-screen bg-gray-50 p-6 w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Rental Not Found</h1>
            <a href="/user/dashboard" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Track Delivery - ${rental.tank_type}`} />
      <div className="min-h-screen bg-gray-50 p-6 w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Breadcrumbs breadcrumbs={breadcrumbsWithTrack} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Delivery</h1>
              <p className="text-gray-600">
                {rental.tank_type} - {rental.pickup_type === 'delivery' ? 'Delivery' : 'Pickup'}
              </p>
            </div>
            <a
              href="/user/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(rental.status)}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {getStatusText(rental.status)}
                </h2>
                <p className="text-sm text-gray-600">
                  Request ID: #{rental.id}
                </p>
                {rental.tracking_number && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Tracking Number: {rental.tracking_number}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Requested</p>
              <p className="font-medium">
                {new Date(rental.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Live Tracking
          </h3>
          <DeliveryTrackingMap
            deliveryLocation={rental.pickup_type === 'delivery' ? rental.delivery_location : undefined}
            pickupLocation={rental.pickup_type === 'pickup' ? rental.pickup_location : undefined}
            currentLocation={currentLocation}
            isDelivered={isDelivered}
            className="h-96 w-full"
          />
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rental.pickup_type === 'delivery' && rental.delivery_location && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Delivery Address
              </h3>
              <p className="text-gray-600">{rental.delivery_location.address}</p>
            </div>
          )}

          {rental.pickup_type === 'pickup' && rental.pickup_location && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-red-500" />
                Pickup Location
              </h3>
              <p className="text-gray-600">{rental.pickup_location.address}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-500" />
              Tank Details
            </h3>
            <p className="text-gray-600">{rental.tank_type}</p>
            <p className="text-sm text-gray-500 mt-1">
              Type: {rental.pickup_type === 'delivery' ? 'Delivery' : 'Pickup'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        {rental.status === 'in_transit' && !isDelivered && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Delivery Instructions</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Please ensure someone is available to receive the delivery</li>
              <li>• Have your ID ready for verification</li>
              <li>• Check the tank condition upon delivery</li>
              <li>• Track location updates every 30 seconds</li>
            </ul>
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Delivery Complete!</h3>
            <p className="text-green-700">
              Your {rental.tank_type} has been successfully delivered. Thank you for choosing MV Oxygen Trading!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
