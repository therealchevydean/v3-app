import { PinData } from '../lib/types';
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const pins: Omit<PinData, 'id'>[] = [
  {
    name: "Community Food Drive",
    description: "Join us in collecting non-perishable food items for local families in need.",
    location: {
      latitude: 39.7392,
      longitude: -104.9903
    },
    type: "event",
    creator: "Denver Community Outreach"
  },
  {
    name: "Hope Shelter",
    description: "Providing a safe and warm place for those experiencing homelessness.",
    location: {
      latitude: 32.5252,
      longitude: -93.7502
    },
    type: "shelter",
    creator: "Shreveport Hope"
  },
  {
    name: "Online Donation Drive for School Supplies",
    description: "Help us raise funds to provide school supplies for students in our community.",
    location: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    type: "online-event",
    creator: "LA Students First"
  }
];

async function seedCommunityPins() {
  const pinsCollection = db.collection("pins");

  for (const pin of pins) {
    await pinsCollection.add(pin);
    console.log(`Added pin: ${pin.name}`);
  }

  console.log("Community pin seeding complete!");
  process.exit(0);
}

seedCommunityPins().catch(error => {
  console.error("Error seeding community pins: ", error);
  process.exit(1);
});
