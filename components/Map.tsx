'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback, useState, useEffect } from 'react';
import { PinData, DestinationData, MineableItem } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import * as gameService from '@/services/gameService';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

interface MapProps {
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    settingDestination: boolean;
    setSettingDestination: React.Dispatch<React.SetStateAction<boolean>>;
}

function Map({setBalance, settingDestination, setSettingDestination}: MapProps) {
  const { user } = useAuth();
  const { userLocation } = useGeolocation();

  const [pins, setPins] = useState<PinData[]>([]);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [center, setCenter] = useState({ lat: -3.745, lng: -38.523 });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    async function getMapItems() {
        const { pins, destinations } = await gameService.fetchMapItems();
        setPins(pins);
        setDestinations(destinations);
    }
    getMapItems();
  }, []);

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
      handleLocationUpdate(userLocation);
    }
  }, [userLocation]);

  const handleLocationUpdate = useCallback(async (location: { lat: number; lng: number }) => {
    if (!user) return;

    // Check for destination arrival
    const userDestination = destinations.find(d => d.type === 'user-destination' && d.creator === user.uid);
    if (userDestination) {
        const distance = gameService.getDistance(location.lat, location.lng, userDestination.location.latitude, userDestination.location.longitude);
        if (distance < 0.05) { // 50m arrival radius
            alert(`Destination reached! Geodrop of ${userDestination.reward} MOBX received!`);
            await gameService.updateUserBalance(user.uid, userDestination.reward);
            setBalance(prev => prev + userDestination.reward);
            await gameService.deleteDestination(userDestination.id);
            setDestinations(destinations.filter(d => d.id !== userDestination.id));
            return; // Mission complete
        }
    }

    // Check for geomining
    const itemsToMine: MineableItem[] = [...pins, ...destinations.filter(d => d.id !== userDestination?.id)];
    const { reward, found, minedItem } = await gameService.geomine(location, itemsToMine);
    if (found && minedItem) {
        await gameService.updateUserBalance(user.uid, reward);
        setBalance(prev => prev + reward);

        // Remove the mined item from the map
        if (minedItem.type === 'community-pin') {
            setPins(pins.filter(p => p.id !== minedItem.id));
        } else {
            setDestinations(destinations.filter(d => d.id !== minedItem.id));
        }
    }

  }, [user, destinations, pins, setBalance]);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!user || !e.latLng || !settingDestination) return;

    const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const newDestination = await gameService.addUserDestination(user.uid, location);
    setDestinations([...destinations, newDestination]);
    setSettingDestination(false);
    alert('Destination set! Your geodrop is waiting.');
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick}
    >
      {userLocation && <Marker position={userLocation} />}
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={{ lat: pin.location.latitude, lng: pin.location.longitude }}
          title={pin.name}
        />
      ))}
      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          position={{
            lat: destination.location.latitude,
            lng: destination.location.longitude,
          }}
          title={destination.name}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default Map;
