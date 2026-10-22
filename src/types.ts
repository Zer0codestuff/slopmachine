export type Media = 'image' | 'video';
export type View = 'scatter' | 'quality' | 'cost' | 'table';
export interface Model {
  id: string;
  name: string;
  provider: string;
  rank: number;
  score: number;
  confidenceLow: number | null;
  confidenceHigh: number | null;
  votes: number | null;
  price: number | null;
  priceUnit: string | null;
  priceNote: string | null;
  priceSourceUrl: string | null;
  modelUrl: string | null;
}
export interface Leaderboard {
  id: string;
  media: Media;
  sourceName: string;
  sourceUrl: string;
  methodologyUrl: string;
  task: string;
  shortTask: string;
  scoreType: string;
  observedAt: string;
  sourceUpdatedAt: string | null;
  priceUnit: string;
  notes: string[];
  entries: Model[];
}
export interface Catalog {
  generatedAt: string;
  leaderboards: Leaderboard[];
}
