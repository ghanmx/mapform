import { useRef, useState, useEffect } from "react";
import { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import PaymentWindow from "./payment/PaymentWindow";
import { showRouteNotification, showPaymentNotification } from "@/utils/notificationUtils";
import { MapLayout } from "./map/MapLayout";
import { MapHeader } from "./map/MapHeader";
import { MapBottomControls } from "./map/MapBottomControls";
import { MapContainerComponent } from "./map/MapContainer";
import { MapControlPanel } from "./map/MapControlPanel";
import { LocationPanels } from "./map/LocationPanels";
import { useToast } from "@/hooks/use-toast";
import { getAddressFromCoordinates } from "@/services/geocodingService";
import { TowingProvider } from "@/contexts/TowingContext";

const TowMap = () => {
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dropLocation, setDropLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [dropAddress, setDropAddress] = useState<string>("");
  const [selectingPickup, setSelectingPickup] = useState(false);
  const [selectingDrop, setSelectingDrop] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const mapRef = useRef<Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updateAddresses = async () => {
      if (pickupLocation) {
        const address = await getAddressFromCoordinates(pickupLocation.lat, pickupLocation.lng);
        setPickupAddress(address);
      }
      if (dropLocation) {
        const address = await getAddressFromCoordinates(dropLocation.lat, dropLocation.lng);
        setDropAddress(address);
      }
    };

    updateAddresses();
  }, [pickupLocation, dropLocation]);

  const validateLocations = () => {
    if (!pickupLocation || !dropLocation) {
      toast({
        title: "Missing Locations",
        description: "Please select both pickup and drop-off locations before proceeding",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleLocationSearch = async (location: { lat: number; lng: number; address: string }, type: 'pickup' | 'drop') => {
    if (type === 'pickup') {
      setPickupLocation({ lat: location.lat, lng: location.lng });
      setPickupAddress(location.address);
    } else {
      setDropLocation({ lat: location.lat, lng: location.lng });
      setDropAddress(location.address);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    if (selectingPickup) {
      setPickupLocation(location);
      setSelectingPickup(false);
    } else if (selectingDrop) {
      setDropLocation(location);
      setSelectingDrop(false);
    }
  };

  const handleRouteCalculated = (distance: number) => {
    showRouteNotification(distance);
  };

  const handlePaymentSubmit = (result: { success: boolean; error?: string }) => {
    showPaymentNotification(result.success, result.error);
    if (result.success) {
      setIsPaymentComplete(true);
    }
  };

  const handleRequestTow = () => {
    if (!validateLocations()) return;
    
    if (isPaymentComplete) {
      toast({
        title: "Payment Already Completed",
        description: "Your tow truck request is already being processed",
      });
      return;
    }
    
    setShowPayment(true);
  };

  return (
    <TowingProvider>
      <MapLayout>
        <MapHeader />
        
        <div className="relative h-[calc(100vh-4rem)]">
          <MapControlPanel
            selectingPickup={selectingPickup}
            selectingDrop={selectingDrop}
            setSelectingPickup={setSelectingPickup}
            setSelectingDrop={setSelectingDrop}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
          />

          <div className="absolute inset-0 z-10">
            <MapContainerComponent
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              selectingPickup={selectingPickup}
              selectingDrop={selectingDrop}
              onLocationSelect={(location) => {
                if (selectingPickup) {
                  setPickupLocation(location);
                  setSelectingPickup(false);
                } else if (selectingDrop) {
                  setDropLocation(location);
                  setSelectingDrop(false);
                }
              }}
              setPickupLocation={setPickupLocation}
              setDropLocation={setDropLocation}
              onRouteCalculated={(distance) => showRouteNotification(distance)}
            />
          </div>

          <LocationPanels
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            pickupAddress={pickupAddress}
            dropAddress={dropAddress}
            handleLocationSearch={async (location, type) => {
              if (type === 'pickup') {
                setPickupLocation({ lat: location.lat, lng: location.lng });
                setPickupAddress(location.address);
              } else {
                setDropLocation({ lat: location.lat, lng: location.lng });
                setDropAddress(location.address);
              }
            }}
          />

          <div className="absolute bottom-6 inset-x-0 z-30 px-6">
            <MapBottomControls
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              onRequestTow={() => {
                if (!pickupLocation || !dropLocation) {
                  toast({
                    title: "Missing Locations",
                    description: "Please select both pickup and drop-off locations",
                    variant: "destructive",
                  });
                  return;
                }
                setShowPayment(true);
              }}
            />
          </div>

          <PaymentWindow
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onPaymentSubmit={(result) => {
              showPaymentNotification(result.success, result.error);
              if (result.success) {
                setIsPaymentComplete(true);
              }
            }}
            totalCost={totalCost}
          />
        </div>
      </MapLayout>
    </TowingProvider>
  );
};

export default TowMap;