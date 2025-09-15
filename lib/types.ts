export interface PinData {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  description?: string;
  creator?: string;
  type?: 'community-pin' | 'user-destination' | 'nft-drop';
  image?: string; // For NFTs
  tokenId?: string; // For NFTs
}

export interface DestinationData extends PinData {
  reward: number;
}

export type MineableItem = PinData & { reward?: number };
