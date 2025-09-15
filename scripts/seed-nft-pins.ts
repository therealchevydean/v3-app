import { db } from '../lib/firebase-admin.js';
import { PinData } from '../lib/types.js';

const nftPins: Omit<PinData, 'id'>[] = [
  {
    name: 'Golden Sigil of Denver',
    description: 'A rare NFT drop at the heart of the city.',
    location: { latitude: 39.7392, longitude: -104.9903 },
    type: 'nft-drop',
    image: 'https://path.to/your/nft/image.png',
    tokenId: 'DENVER001',
  },
  {
    name: 'Cherry Creek Sigil',
    description: 'An exclusive NFT found only in Cherry Creek.',
    location: { latitude: 39.7169, longitude: -104.9439 },
    type: 'nft-drop',
    image: 'https://path.to/your/nft/image2.png',
    tokenId: 'CHERRY001',
  },
];

async function seedNftPins() {
  const pinsCollection = db.collection('pins');
  for (const pin of nftPins) {
    try {
      await pinsCollection.add(pin);
      console.log(`Added NFT pin: ${pin.name}`);
    } catch (error) {
      console.error('Error adding NFT pin:', error);
    }
  }
}

seedNftPins();
