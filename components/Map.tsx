'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { PinData, DestinationData, MineableItem } from '@/lib/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

async function geomine(location: { lat: number; lng: number }, items: MineableItem[]) {
  console.log('Geomining in progress...');

  for (const item of items) {
    const distance = getDistance(
      location.lat,
      location.lng,
      item.location.latitude,
      item.location.longitude
    );

    if (distance < 0.05) { // 50-meter radius for mining
      console.log(`Near item: ${item.name}`);
      const reward = item.reward || Math.floor(Math.random() * 10) + 1;
      console.log(`Mined ${reward} MOBX!`);
      return { reward, found: true };
    }
  }

  console.log('No items found nearby.');
  return { reward: 0, found: false };
}

interface MapProps {
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    settingDestination: boolean;
    setSettingDestination: React.Dispatch<React.SetStateAction<boolean>>;
}

function Map({setBalance, settingDestination, setSettingDestination}: MapProps) {
  const [user, setUser] = useState<User | null>(null);
  const [pins, setPins] = useState<PinData[]>([]);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState({ lat: -3.745, lng: -38.523 });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
    });

    async function fetchData() {
      const pinsCollection = collection(db, 'pins');
      const pinsSnapshot = await getDocs(pinsCollection);
      const pinsData = pinsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PinData[];
      setPins(pinsData);

      const destinationsCollection = collection(db, 'destinations');
      const destinationsSnapshot = await getDocs(destinationsCollection);
      const destinationsData = destinationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DestinationData[];
      setDestinations(destinationsData);
    }

    fetchData();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newUserLocation = { lat: latitude, lng: longitude };
          setUserLocation(newUserLocation);
          setCenter(newUserLocation);
          handleLocationUpdate(newUserLocation);
        },
        (error) => {
          console.error('Error getting user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  const handleLocationUpdate = useCallback(async (location: { lat: number; lng: number }) => {
    if (!user) return;

    setUserLocation(location);

    const userDestination = destinations.find(d => d.type === 'user-destination' && d.creator === user.uid);

    if (userDestination) {
      const distance = getDistance(location.lat, location.lng, userDestination.location.latitude, userDestination.location.longitude);

      if (distance < 0.05) { // 50-meter arrival radius
        const reward = userDestination.reward;
        alert(`Destination reached! Geodrop of ${reward} MOBX received!`);

        setBalance(prev => prev + reward);
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { balance:  userDestination.reward });

        const destDocRef = doc(db, 'destinations', userDestination.id);
        await deleteDoc(destDocRef);

        setDestinations(destinations.filter(d => d.id !== userDestination.id));
        return; // Mission complete
      }
    }

    const itemsToMine: MineableItem[] = [...pins, ...destinations.filter(d => d.id !== userDestination?.id)];
    const { reward, found } = await geomine(location, itemsToMine);
    if (found) {
        setBalance(prev => prev + reward);
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { balance: reward });
    }
  }, [user, destinations, pins, setBalance]);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!user || !e.latLng) return;

    if (settingDestination) {
      const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      console.log('Setting destination at', location);
      const newDestination: Omit<DestinationData, 'id'> = {
        name: 'User Destination',
        description: `Set by ${user.uid}`,
        location: { latitude: location.lat, longitude: location.lng },
        creator: user.uid,
        type: 'user-destination',
        reward: 100, // Predefined reward
      };
      const docRef = await addDoc(collection(db, 'destinations'), newDestination);
      setDestinations([...destinations, { id: docRef.id, ...newDestination }]);
      setSettingDestination(false);
      alert('Destination set! Your geodrop is waiting.');
    }
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
