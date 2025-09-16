'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { PinData, DestinationData, MineableItem } from '@/lib/types';

// Haversine distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function geomine(location: { lat: number; lng: number }, items: MineableItem[]): Promise<{ reward: number; found: boolean; minedItem?: MineableItem }> {
  for (const item of items) {
    const distance = getDistance(
      location.lat,
      location.lng,
      item.location.latitude,
      item.location.longitude
    );

    if (distance < 0.05) { // 50-meter radius for mining
      const reward = item.reward || Math.floor(Math.random() * 10) + 1;
      return { reward, found: true, minedItem: item };
    }
  }

  return { reward: 0, found: false };
}

export async function fetchMapItems(): Promise<{ pins: PinData[], destinations: DestinationData[] }> {
    const pinsCollection = collection(db, 'pins');
    const pinsSnapshot = await getDocs(pinsCollection);
    const pinsData = pinsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PinData[];

    const destinationsCollection = collection(db, 'destinations');
    const destinationsSnapshot = await getDocs(destinationsCollection);
    const destinationsData = destinationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DestinationData[];

    return { pins: pinsData, destinations: destinationsData };
}

export async function updateUserBalance(userId: string, amount: number): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        balance: increment(amount)
    });
}

export async function addUserDestination(userId: string, location: { lat: number; lng: number }): Promise<DestinationData> {
    const newDestination: Omit<DestinationData, 'id'> = {
        name: 'User Destination',
        description: `Set by ${userId}`,
        location: { latitude: location.lat, longitude: location.lng },
        creator: userId,
        type: 'user-destination',
        reward: 100, // Predefined reward
    };
    const docRef = await addDoc(collection(db, 'destinations'), newDestination);
    return { id: docRef.id, ...newDestination };
}

export async function deleteDestination(destinationId: string): Promise<void> {
    const destDocRef = doc(db, 'destinations', destinationId);
    await deleteDoc(destDocRef);
}

// Make sure getDistance is exported so Map.tsx can use it
// Other existing exports remain unchanged
export { getDistance };
