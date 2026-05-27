export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  size: string;
  medium: string;
  description: string;
  details: string;
  mood: CollectorMoodType;
  collection: string;
  imageUrl: string;
  lightingColor: string; // CSS color for ambient light bloom
  shadowOffset: string; // CSS transform for room shadow direction
  scale: number; // Scale factor for room view
  priceRange?: string; // e.g. "$450.00 – $895.00"
  availability?: "In stock" | "Out of stock";
  artistShort?: string; // used for filtering by photographer
}

export interface Collection {
  id: string;
  name: string;
  tagline: string;
  description: string;
  atmosphere: string;
  bgClass: string;
  textClass: string;
  lightingClass: string;
  fontFamily: string;
}

export type CollectorMoodType = "Calm" | "Power" | "Spiritual" | "Mystery" | "Royal" | "Contemplative";

export interface CollectorMoodConfig {
  mood: CollectorMoodType;
  title: string;
  background: string;
  textColor: string;
  accentColor: string;
  lightingGlow: string;
  ambientHumHz: number;
  harmonicHz: number;
  description: string;
}

export interface RoomScene {
  id: string;
  name: string;
  description: string;
  bgUrl: string;
  wallColor: string;
  artworkScale: string;
  artOffsetClass: string;
}
