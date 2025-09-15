import { DestinationData } from '../lib/types';
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Sample destinations data
const destinations: Omit<DestinationData, 'id'>[] = [
  {
    name: "Pike Place Market",
    description: "Historic market in Seattle. A great place to explore!",
    location: {
      latitude: 47.6097,
      longitude: -122.3422
    },
    creator: "Community",
    type: "community-destination",
    reward: 50
  },
  {
    name: "Gateway Arch",
    description: "Iconic arch in St. Louis, symbolizing westward expansion.",
    location: {
      latitude: 38.6247,
      longitude: -90.1848
    },
    creator: "Community",
    type: "community-destination",
    reward: 50
  },
  {
    name: "V3 HQ (Test)",
    description: "A test destination for development.",
    location: {
      latitude: 33.7490,
      longitude: -84.3880
    },
    creator: "V3",
    type: "special-event",
    reward: 100
  }
];

// Function to seed destinations
async function seedDestinations() {
  const destinationsCollection = db.collection("destinations");

  console.log("Seeding destinations...");

  for (const destination of destinations) {
    await destinationsCollection.add(destination);
    console.log(`Added destination: ${destination.name}`);
  }

  console.log("Destinations seeding complete!");
  process.exit(0);
}

// Run the seeder
seedDestinations().catch(error => {
  console.error("Error seeding destinations:", error);
  process.exit(1);
});
