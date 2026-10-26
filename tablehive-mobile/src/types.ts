export interface MenuItem {
  id?: string;
  _id?: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  image: string;
  desc?: string;
  isAvailable?: boolean;
  popular?: boolean;
  rating?: number;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedBy?: string;
}

export interface Guest {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
}

export interface TrendingSong {
  id: string;
  title: string;
  artist: string;
  movieOrAlbum: string;
  category: 'Bollywood' | 'Indie Pop' | 'Global Hit';
  tag: string;
  year: string;
  icon: string;
  vibe: string;
}

export interface RadioStation {
  id: string;
  title: string;
  genre: string;
  cover: string;
  streamUrl: string;
  desc: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export interface CricketMatch {
  id: string;
  series: string;
  format: string;
  team1: { name: string; score?: string; overs?: string; fullScore?: string };
  team2: { name: string; score?: string; overs?: string; fullScore?: string };
  status: string;
  venue?: string;
}
