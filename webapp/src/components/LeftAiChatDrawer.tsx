'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, Send, Bot, User, Trash2, Sparkles, Coffee, 
  Loader2, Plus, Check, Music, Play, Pause, 
  SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, 
  Newspaper, Headphones, ArrowRight, MessageSquare, Radio,
  Trophy, Film, Gamepad2, Video, ChevronDown, ChevronUp,
  ExternalLink, Flame, Zap, HelpCircle, Compass, ShoppingBag,
  CheckCircle2, Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  role: 'user' | 'model' | 'ai';
  text: string;
  followUps?: string[];
}


interface LiveCricketMatch {
  id: number;
  series: string;
  desc: string;
  format: string;
  state: string;
  status: string;
  shortStatus: string;
  isLive: boolean;
  team1: {
    id?: number;
    name: string;
    shortName: string;
    score: string;
    overs: string;
    fullScore: string;
  };
  team2: {
    id?: number;
    name: string;
    shortName: string;
    score: string;
    overs: string;
    fullScore: string;
  };
  venue: string;
}

interface TopicNewsItem {
  title: string;
  summary: string;
  category: string;
  industry?: string;
  source?: string;
  time: string;
}

interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  cover: string;
  url: string;
}

interface SelectableQuestion {
  text: string;
  icon: string;
  category: string;
}

// Chat storage key is now table-specific to isolate per-table conversations
const getChatStorageKey = (tableNo: string | null) => `tablehive_chat_table_${tableNo || 'guest'}`;

const RADIO_STREAMS: RadioTrack[] = [
  { id: 'lofi', title: 'Chill Lounge & Lo-Fi', artist: 'I Love Radio Lo-Fi', genre: 'Lo-Fi Chill', cover: '☕', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'groove', title: 'Groove Salad Ambient', artist: 'SomaFM Ambient', genre: 'Downtempo Beats', cover: '🌿', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'acoustic', title: 'Acoustic Morning Blend', artist: 'Chillout Lounge', genre: 'Acoustic Guitars', cover: '🥐', url: 'https://streams.ilovemusic.de/iloveradio14.mp3' },
  { id: 'jazz', title: 'Smooth Coffeehouse Jazz', artist: 'SomaFM Sonic Universe', genre: 'Café Jazz & Sax', cover: '🎷', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
  { id: 'bollywood', title: 'Bollywood Acoustic Hits', artist: 'Zeno Radio India', genre: 'Desi Acoustic Vibes', cover: '🎸', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' },
  { id: 'ambient', title: 'Ambient Rain & Piano', artist: 'SomaFM DefCon', genre: 'Peaceful Ambient', cover: '🌧️', url: 'https://ice1.somafm.com/defcon-128-mp3' },
];

const DEFAULT_MUSIC_NEWS: TopicNewsItem[] = [
  {
    title: "Lo-Fi Beats Surpass 10 Billion Streams in Artisan Cafés Worldwide",
    summary: "Ambient study and coffeehouse lo-fi beats reach an all-time high as acoustic dining spaces curate personalized customer listening sessions.",
    category: "Trending Beats",
    time: "Live Now"
  },
  {
    title: "The Science of Coffee & Chords: Why Jazz Enhances Flavor",
    summary: "Culinary psychology research shows mellow acoustic and jazz frequencies heighten taste receptors' perception of dark chocolate and espresso crema.",
    category: "Flavor Science",
    time: "Café Insight"
  },
  {
    title: "Coldplay & Top Acoustic Artists Drop Exclusive Coffeehouse EP",
    summary: "The band reveals surprise intimate acoustic pop-ups in select indie coffeehouses across global metropolises this season.",
    category: "Live Acoustic",
    time: "45m ago"
  },
  {
    title: "Warm Analog Vinyl vs Digital: Why Cafés Are Choosing Lo-Fi",
    summary: "New café acoustic studies demonstrate warm vintage audio textures increase table relaxation and enhance companion conversations.",
    category: "Café Culture",
    time: "2h ago"
  }
];

interface TrendingSong {
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

const TRENDING_NEW_SONGS: TrendingSong[] = [
  { id: 'aaj-ki-raat', title: 'Aaj Ki Raat', artist: 'Sachin-Jigar, Madhubanti Bagchi, Divya Kumar', movieOrAlbum: 'Stree 2', category: 'Bollywood', tag: 'CHARTBUSTER #1', year: '2025', icon: '🔥', vibe: 'High-Energy Dance Groove' },
  { id: 'aayi-nai', title: 'Aayi Nai', artist: 'Pawan Singh, Simran Choudhary, Sachin-Jigar', movieOrAlbum: 'Stree 2', category: 'Bollywood', tag: 'VIRAL ANTHEM', year: '2025', icon: '💃', vibe: 'Desi Folk Beats' },
  { id: 'tauba-tauba', title: 'Tauba Tauba', artist: 'Karan Aujla', movieOrAlbum: 'Bad Newz', category: 'Bollywood', tag: 'GLOBAL VIRAL', year: '2025', icon: '⚡', vibe: 'Punjabi Pop Beat' },
  { id: 'sajni', title: 'Sajni Re', artist: 'Arijit Singh & Ram Sampath', movieOrAlbum: 'Laapataa Ladies', category: 'Bollywood', tag: 'SOULFUL ACOUSTIC', year: '2025', icon: '🎸', vibe: 'Pure Acoustic Romance' },
  { id: 'jo-tum-mere-ho', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', movieOrAlbum: 'Indie Release', category: 'Indie Pop', tag: 'TRENDING ROMANCE', year: '2025', icon: '🎧', vibe: 'Warm Acoustic Guitars' },
  { id: 'husn', title: 'Husn', artist: 'Anuv Jain', movieOrAlbum: 'Indie Release', category: 'Indie Pop', tag: '100M+ STREAMS', year: '2025', icon: '✨', vibe: 'Soul-Stirring Indie Poetry' },
  { id: 'tu-hai-kahaan', title: 'Tu Hai Kahaan', artist: 'AUR', movieOrAlbum: 'Indie Pop', category: 'Indie Pop', tag: 'CHILL EMOTION', year: '2025', icon: '🌌', vibe: 'Mellow Indie Acoustic' },
  { id: 've-haaniyaan', title: 'Ve Haaniyaan', artist: 'Danny, Avvy Sra, Sagar', movieOrAlbum: 'Indie Release', category: 'Indie Pop', tag: 'ROMANTIC VIRAL', year: '2025', icon: '💖', vibe: 'Melodious Acoustic' },
  { id: 'suniyan-suniyan', title: 'Suniyan Suniyan', artist: 'Juss x MixSingh', movieOrAlbum: 'Indie Release', category: 'Indie Pop', tag: 'CHILL POP', year: '2025', icon: '🌙', vibe: 'Late Night Chill Vibes' },
  { id: 'angaron', title: 'Angaaron (The Couple Song)', artist: 'Shreya Ghoshal & DSP', movieOrAlbum: 'Pushpa 2: The Rule', category: 'Bollywood', tag: 'BLOCKBUSTER', year: '2025', icon: '🕺', vibe: 'Folk-Pop Celebration' },
  { id: 'naina', title: 'Naina', artist: 'Diljit Dosanjh & Badshah', movieOrAlbum: 'Crew', category: 'Bollywood', tag: 'GROOVY POP', year: '2025', icon: '🕶️', vibe: 'Smooth Club Pop' },
  { id: 'pehle-bhi-main', title: 'Pehle Bhi Main', artist: 'Vishal Mishra & Raj Shekhar', movieOrAlbum: 'Animal', category: 'Bollywood', tag: 'MELODIC HIT', year: '2024–2025', icon: '🎶', vibe: 'Deep Emotional Melody' },
  { id: 'die-with-a-smile', title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', movieOrAlbum: 'Global Single', category: 'Global Hit', tag: 'BILLBOARD #1', year: '2025', icon: '🌟', vibe: 'Classic Soul & Piano' },
  { id: 'espresso-song', title: 'Espresso', artist: 'Sabrina Carpenter', movieOrAlbum: 'Short n Sweet', category: 'Global Hit', tag: 'VIRAL POP', year: '2025', icon: '☕', vibe: 'Funky Café Pop' },
  { id: 'birds-feather', title: 'Birds of a Feather', artist: 'Billie Eilish', movieOrAlbum: 'HIT ME HARD AND SOFT', category: 'Global Hit', tag: 'CHILL ACOUSTIC', year: '2025', icon: '🕊️', vibe: 'Ethereal Melodic Chill' }
];

interface MovieClip {
  id: string;
  title: string;
  year: string;
  industry: 'Bollywood' | 'South' | 'Hollywood';
  industryLabel: string;
  genre: string;
  director: string;
  cast: string;
  youtubeId: string;
  aiHighlight: string;
  suggestedSnack: string;
  trivia: string;
}

const MOVIE_CLIPS: MovieClip[] = [
  {
    id: 'pushpa2',
    title: 'Pushpa 2: The Rule',
    year: '2024–2025',
    industry: 'South',
    industryLabel: 'Tollywood',
    genre: 'Pan-India Action Thriller',
    director: 'Sukumar',
    cast: 'Allu Arjun, Rashmika Mandanna, Fahadh Faasil',
    youtubeId: 'g3JUbgHiXvQ',
    aiHighlight: "Allu Arjun returns with iconic swagger and mass intensity as Pushpa Raj rules the nation.",
    suggestedSnack: "Spicy Chipotle Veg Burger & Peri-Peri Fries",
    trivia: "The mass trailer shattered all-time Indian digital records with over 100M+ views in 24 hours."
  },
  {
    id: 'stree2',
    title: 'Stree 2: Sarkate Ka Aatank',
    year: '2024',
    industry: 'Bollywood',
    industryLabel: 'Bollywood',
    genre: 'Horror Comedy Blockbuster',
    director: 'Amar Kaushik',
    cast: 'Shraddha Kapoor, Rajkummar Rao, Pankaj Tripathi',
    youtubeId: 'KVnhePfPxmA',
    aiHighlight: "Chanderi faces Sarkata in India's highest-grossing Hindi movie of all time.",
    suggestedSnack: "Crispy Peri-Peri Fries & Dark Chocolate Brownie",
    trivia: "Stree 2 crossed ₹600 Crore net at the Indian box office, setting the all-time biggest Hindi cinema milestone."
  },
  {
    id: 'deadpool',
    title: 'Deadpool & Wolverine',
    year: '2024',
    industry: 'Hollywood',
    industryLabel: 'Hollywood',
    genre: 'Marvel Multiverse Action Comedy',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
    youtubeId: '73_1biulkYk',
    aiHighlight: "The Merc with a Mouth teams up with Wolverine in Marvel's R-rated multiversal epic.",
    suggestedSnack: "Loaded Nachos Supreme & Iced Americano",
    trivia: "Grossed over $1.33 Billion worldwide, becoming the highest-grossing R-rated film in cinematic history."
  },
  {
    id: 'kalki',
    title: 'Kalki 2898 AD',
    year: '2024',
    industry: 'South',
    industryLabel: 'Tollywood',
    genre: 'Mythological Sci-Fi Epic',
    director: 'Nag Ashwin',
    cast: 'Prabhas, Amitabh Bachchan, Deepika Padukone, Kamal Haasan',
    youtubeId: 'kQDd1AhGIHk',
    aiHighlight: "A futuristic dystopian sci-fi blended with Mahabharata mythology and stunning visual effects.",
    suggestedSnack: "Truffle Margherita Pizza & Golden Crema Cappuccino",
    trivia: "Amitabh Bachchan performed intense stunt sequences at age 81 as the immortal warrior Ashwatthama."
  },
  {
    id: 'dune2',
    title: 'Dune: Part Two',
    year: '2024',
    industry: 'Hollywood',
    industryLabel: 'Hollywood',
    genre: 'Sci-Fi Visual Masterpiece',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler',
    youtubeId: 'Way9Dexny3w',
    aiHighlight: "Paul Atreides unites with Chani and the Fremen to wage revenge against the conspirators.",
    suggestedSnack: "Toasted Hazelnut Latte & Artisan Crostini",
    trivia: "Shot entirely using IMAX digital cameras, with legendary practical sets built across Abu Dhabi and Jordan."
  },
  {
    id: 'singham',
    title: 'Singham Again',
    year: '2024',
    industry: 'Bollywood',
    industryLabel: 'Bollywood',
    genre: 'Cop Universe Action',
    director: 'Rohit Shetty',
    cast: 'Ajay Devgn, Kareena Kapoor, Deepika Padukone, Ranveer Singh, Akshay Kumar',
    youtubeId: 'V_UsmZfMupk',
    aiHighlight: "Bajirao Singham leads the star-studded Cop Universe inspired by the epic Ramayana.",
    suggestedSnack: "Double Brioche Crunch Burger & Salted Caramel Frappé",
    trivia: "Brought together Ajay Devgn, Akshay Kumar, Ranveer Singh, and Salman Khan in high-octane cameos."
  },
  {
    id: 'devara',
    title: 'Devara: Part 1',
    year: '2024',
    industry: 'South',
    industryLabel: 'Tollywood',
    genre: 'High-Seas Action Drama',
    director: 'Koratala Siva',
    cast: 'Jr NTR, Saif Ali Khan, Janhvi Kapoor',
    youtubeId: '4g_5Yd_g2oA',
    aiHighlight: "Jr NTR dominates coastal seas with fierce action, backed by Anirudh Ravichander's thunderous score.",
    suggestedSnack: "Paneer Tikka Crostini & Cold Brew Float",
    trivia: "Features massive underwater battle choreographies with Anirudh's viral sensation songs."
  },
  {
    id: 'gladiator2',
    title: 'Gladiator II',
    year: '2024',
    industry: 'Hollywood',
    industryLabel: 'Hollywood',
    genre: 'Historical Action Epic',
    director: 'Ridley Scott',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington',
    youtubeId: '4rgYUipGJNo',
    aiHighlight: "Lucius enters the Colosseum after Roman emperors conquer his home in an epic saga of vengeance and honor.",
    suggestedSnack: "Charred Garlic Sourdough & Signature Cold Espresso",
    trivia: "The long-awaited sequel to the 2000 Best Picture winner features a colossal flooded Colosseum naval battle."
  }
];

const TOPIC_QUESTIONS: Record<string, SelectableQuestion[]> = {
  Cricket: [
    { text: "What is the live cricket match score and equation right now?", icon: "🏏", category: "Live Match" },
    { text: "Which spicy snacks pair best with the death overs?", icon: "🍟", category: "Snack Pairing" },
    { text: "Who is predicted to win today's match and key records?", icon: "🏆", category: "Prediction" },
    { text: "Who holds the fastest century in T20 cricket history?", icon: "⚡", category: "Match Trivia" },
    { text: "Recommend an energizing drink for watching the final overs!", icon: "☕", category: "Beverage" },
  ],
  Music: [
    { text: "What are the latest 2025–2026 trending new songs in Bollywood & Indie?", icon: "🔥", category: "New Song Releases" },
    { text: "Suggest top trending acoustic and chill Lo-Fi songs to listen to", icon: "🎵", category: "Trending Tracks" },
    { text: "Recommend soothing Bollywood unplugged & acoustic indie songs", icon: "🎸", category: "Bollywood Acoustic" },
    { text: "What are the best soulful coffeehouse jazz melodies & saxophone tracks?", icon: "🎷", category: "Café Jazz" },
    { text: "Recommend a peaceful acoustic playlist for our café conversation", icon: "🎧", category: "Chill Playlist" },
    { text: "Which live radio station has the best acoustic vibe right now?", icon: "📻", category: "Live Radio" },
    { text: "Suggest soulful songs by Prateek Kuhad, Anuv Jain, Jasleen & Arijit", icon: "🎶", category: "Indie Melodies" },
  ],
  News: [
    { text: "What are today's top world, culinary & technology headlines?", icon: "📰", category: "Top Stories" },
    { text: "How is sustainable organic coffee farming evolving in 2026?", icon: "🌱", category: "Environment" },
    { text: "Tell me about next-gen AI assistants in restaurant dining", icon: "🤖", category: "Technology" },
    { text: "What are the latest global farm-to-table culinary trends?", icon: "🍽️", category: "Culinary" },
  ],
  Movies: [
    { text: "What are today's top Bollywood, South & Hollywood box office records?", icon: "🎬", category: "Box Office" },
    { text: "Tell me the latest news on Pushpa 2: The Rule, Stree 2 & Kalki 2!", icon: "🔥", category: "Blockbusters" },
    { text: "What's the buzz on Christopher Nolan's next feature & Deadpool?", icon: "🍿", category: "Hollywood" },
    { text: "Which café snacks pair best with action-packed thrillers?", icon: "🍟", category: "Movie Pairing" },
    { text: "Tell me about upcoming Pan-India movies like Ramayana and Coolie", icon: "⭐", category: "Pan-India" },
  ],
  Games: [
    { text: "Challenge our table to a café trivia quiz or brain-teaser!", icon: "🎮", category: "Table Challenge" },
    { text: "What are the best finger foods for tabletop gaming sessions?", icon: "🍟", category: "Game Snacks" },
    { text: "Tell me about trending open-world games and esports championships", icon: "⚡", category: "Esports News" },
    { text: "Can you give us a quick 60-second riddle while our food is cooking?", icon: "🧩", category: "Riddle" },
  ],
  'Short Videos': [
    { text: "What barista latte art techniques are currently going viral?", icon: "📱", category: "Viral Reels" },
    { text: "Tell me about the ASMR crunchy sourdough slicing trend", icon: "🥐", category: "Food ASMR" },
    { text: "Secret café recipes and mocktail hacks trending on reels", icon: "🍹", category: "Secret Recipe" },
  ],
  Food: [
    { text: "What are today's top best-selling chef specials?", icon: "🔥", category: "Best Sellers" },
    { text: "Recommend a signature handcrafted coffee for my mood", icon: "☕", category: "Coffee Match" },
    { text: "I want something spicy and crunchy to share at our table!", icon: "🌶️", category: "Spicy Bites" },
    { text: "What is the most decadent dessert on the menu today?", icon: "🍫", category: "Sweet Indulgence" },
    { text: "What light and healthy vegetarian options do you recommend?", icon: "🥗", category: "Healthy Veg" },
  ]
};

function renderFormattedMessage(text: string, isUser: boolean) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1 whitespace-pre-wrap leading-relaxed text-slate-800">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('** '));
        const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;

        const parts: React.ReactNode[] = [];
        let remaining = cleanLine;
        let pIdx = 0;
        const tokenRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/;

        while (remaining) {
          const match = remaining.match(tokenRegex);
          if (!match) {
            parts.push(<span key={pIdx++}>{remaining}</span>);
            break;
          }
          const matchIndex = match.index || 0;
          if (matchIndex > 0) {
            parts.push(<span key={pIdx++}>{remaining.slice(0, matchIndex)}</span>);
          }
          if (match[2]) {
            parts.push(<strong key={pIdx++} className="font-extrabold text-slate-900">{match[2]}</strong>);
          } else if (match[3]) {
            parts.push(<span key={pIdx++} className="font-semibold text-purple-900 bg-purple-50 px-1 py-0.2 rounded border border-purple-200/60">{match[3]}</span>);
          }
          remaining = remaining.slice(matchIndex + match[0].length);
        }

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-purple-600 font-black text-xs select-none mt-0.5">•</span>
              <div className="flex-1 min-w-0">{parts}</div>
            </div>
          );
        }

        return <div key={lIdx}>{parts}</div>;
      })}
    </div>
  );
}

export default function LeftAiChatDrawer() {
  const router = useRouter();
  const { 
    isLeftAiChatOpen, 
    setIsLeftAiChatOpen, 
    showToast, 
    tableInfo,
    currentSession
  } = useStore();

  // Extract all table interests — also check sessionStorage for immediate availability after interest selection
  const [pendingInterests, setPendingInterests] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const pending = sessionStorage.getItem('th_pending_interests');
        if (pending) return JSON.parse(pending);
      } catch (e) {}
    }
    return [];
  });

  const activeInterests: string[] = (tableInfo?.interests && tableInfo.interests.length > 0)
    ? tableInfo.interests
    : (currentSession?.interests && currentSession.interests.length > 0)
    ? currentSession.interests
    : pendingInterests;

  // Clear pending interests once tableInfo has them
  React.useEffect(() => {
    if (tableInfo?.interests && tableInfo.interests.length > 0 && pendingInterests.length > 0) {
      setPendingInterests([]);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('th_pending_interests');
      }
    }
  }, [tableInfo?.interests]);

  const primaryTopic = activeInterests[0] || 'Music';

  // In AI Mitra, default activeTab to 'chat' so questions and conversations are immediately visible!
  const [activeTab, setActiveTab] = useState<string>('chat');
  // Selected question topic tab inside chat (dynamically matches user's active interest)
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState<string>(primaryTopic || 'Music');

  useEffect(() => {
    if (primaryTopic) {
      setSelectedQuestionTopic(primaryTopic);
    }
  }, [primaryTopic]);

  // Dynamic quick prompts based strictly on the table's active interests
  const quickPrompts = React.useMemo(() => {
    const list: string[] = [];
    const topicsToUse = activeInterests.length > 0 
      ? activeInterests.filter(t => t !== 'AI Barista' && t !== 'AI Mitra') 
      : ['Music'];

    topicsToUse.forEach(t => {
      const qList = TOPIC_QUESTIONS[t];
      if (qList && qList.length > 0) {
        qList.forEach(q => list.push(`${q.icon} ${q.text}`));
      }
    });

    return Array.from(new Set(list));
  }, [activeInterests]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio Radio State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Universal Topic News State (Pre-seeded with instant Music news)
  const [topicNewsMap, setTopicNewsMap] = useState<Record<string, TopicNewsItem[]>>({
    Music: DEFAULT_MUSIC_NEWS
  });
  const [isLoadingTopicNews, setIsLoadingTopicNews] = useState<Record<string, boolean>>({});
  const [selectedSongCategory, setSelectedSongCategory] = useState<'All' | 'Bollywood' | 'Indie Pop' | 'Global Hit'>('All');

  // Cricket Specific State
  const [showCricketIframe, setShowCricketIframe] = useState(false);
  const [cricketRefreshKey, setCricketRefreshKey] = useState(0);
  const [cricketMatches, setCricketMatches] = useState<LiveCricketMatch[]>([]);
  const [selectedCricketMatchIndex, setSelectedCricketMatchIndex] = useState<number>(0);
  const [isLoadingCricket, setIsLoadingCricket] = useState<boolean>(false);

  const activeCricketMatch = cricketMatches[selectedCricketMatchIndex] || cricketMatches[0] || null;

  // Movies Cinema Lounge & AI Clips State
  const [selectedMovieIndustry, setSelectedMovieIndustry] = useState<string>('All');
  const [selectedMovieClipIndex, setSelectedMovieClipIndex] = useState<number>(0);
  const [showMoviePlayer, setShowMoviePlayer] = useState<boolean>(true);
  const activeMovieClip = MOVIE_CLIPS[selectedMovieClipIndex] || MOVIE_CLIPS[0];

  // Poll Real-Time Live Cricket Data from Backend
  const fetchLiveCricket = async () => {
    try {
      setIsLoadingCricket(true);
      const res = await fetch('/api/cricket/live');
      if (res.ok) {
        const data = await res.json();
        if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
          setCricketMatches(data.matches);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch real live cricket scores:', e);
    } finally {
      setIsLoadingCricket(false);
    }
  };

  useEffect(() => {
    fetchLiveCricket();
    const interval = setInterval(fetchLiveCricket, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentTrack = RADIO_STREAMS[currentTrackIndex];

  // Auto-switch question topic when table primary interest changes
  useEffect(() => {
    if (primaryTopic) {
      setSelectedQuestionTopic(primaryTopic);
    }
  }, [primaryTopic]);

  // Auto-trigger first AI Mitra message based on selected interests
  // When the drawer opens fresh (only welcome msg) with real interests, auto-send contextual prompt
  const hasAutoTriggeredRef = React.useRef(false);
  useEffect(() => {
    if (!isLeftAiChatOpen) {
      hasAutoTriggeredRef.current = false; // reset when drawer closes
      return;
    }
    if (hasAutoTriggeredRef.current) return;
    if (activeInterests.length === 0) return;
    // Wait for welcome message to be the only message
    if (messages.length !== 1) return;

    hasAutoTriggeredRef.current = true;

    const autoPrompts: Record<string, string> = {
      Cricket: "What is the live cricket match score and equation right now?",
      Movies: "What are today's top Bollywood, South & Hollywood box office records?",
      Music: "Recommend the best coffee pairings for acoustic lo-fi vibes",
      News: "What are today's top world, culinary & technology headlines?",
      Games: "Challenge our table to a café trivia quiz or brain-teaser!",
      'Short Videos': "What barista latte art techniques are currently going viral?",
      Food: "What are today's top best-selling chef specials and recommendations?",
    };

    const autoPrompt = autoPrompts[primaryTopic] || autoPrompts['Food'];
    if (autoPrompt) {
      const timer = setTimeout(() => {
        handleSendMessage(autoPrompt);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLeftAiChatOpen, messages.length, activeInterests.length, primaryTopic]);

  // Fetch Topic News
  const fetchNewsForTopic = async (topic: string, force = false) => {
    if (!force && topicNewsMap[topic] && topicNewsMap[topic].length > 0) return;
    
    setIsLoadingTopicNews(prev => ({ ...prev, [topic]: true }));
    try {
      const res = await fetch(`/api/ai/topic-news?topic=${encodeURIComponent(topic)}${force ? '&force=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setTopicNewsMap(prev => ({ ...prev, [topic]: data.news }));
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch news for ${topic}:`, e);
    } finally {
      setIsLoadingTopicNews(prev => ({ ...prev, [topic]: false }));
    }
  };

  // Fetch news when activeTab changes (if it's a topic tab)
  useEffect(() => {
    if (activeTab !== 'chat') {
      fetchNewsForTopic(activeTab);
    }
  }, [activeTab]);

  // Generate welcome message
  const getWelcomeText = (topic: string) => {
    switch (topic) {
      case 'Cricket':
        return `🏏 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected Cricket, I'm your live match companion! What would you like to know about today's match, live scores, and café pairings?`;
      case 'Music':
        return `🎵 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected Music, I've loaded our café's live Lo-Fi radio and today's trending music news for you! What music vibes or coffee pairings would you like to explore?`;
      case 'News':
        return `📰 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected News, I've gathered today's top global, tech, and culinary headlines for you!`;
      case 'Movies':
        return `🎬 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected Movies, I've queued up today's box office buzz and cinema headlines for you!`;
      case 'Games':
        return `🎮 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected Games, I've prepared table challenges, trivia quizzes and snack pairings for you!`;
      case 'Short Videos':
        return `📱 Welcome to Table ${tableInfo.tableNo || 'TableHive'}! Since your table selected Short Videos, let's explore viral barista latte art and trending café reels!`;
      default:
        return `Hello! I am your TableHive AI Mitra${tableInfo?.tableNo ? ` at Table #${tableInfo.tableNo}` : ''}. Ask me anything about our menu, coffee roasts, dish pairings, or what to order today!`;
    }
  };

  // Table-specific chat storage key (isolates chat per table number)
  const chatStorageKey = getChatStorageKey(tableInfo?.tableNo ? String(tableInfo.tableNo) : null);

  const prevTableNoRef = React.useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const currentTableNo = tableInfo?.tableNo ? String(tableInfo.tableNo) : null;

    // On initial mount (undefined → something): just load normally
    // On table change (something → different): reset to fresh welcome
    const isTableChange =
      prevTableNoRef.current !== undefined &&
      prevTableNoRef.current !== currentTableNo;

    prevTableNoRef.current = currentTableNo as string | null;

    if (isTableChange) {
      // Table switched — always start fresh chat (never leak cross-table messages)
      setMessages([{ role: 'model', text: getWelcomeText(primaryTopic) }]);
      return;
    }

    // No table set yet — show generic welcome, don't persist to storage
    if (!currentTableNo) {
      setMessages([{ role: 'model', text: getWelcomeText(primaryTopic) }]);
      return;
    }

    // Same table — try to restore saved chat for this specific table
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {}

    // No saved history for this specific table — show fresh welcome
    setMessages([{ role: 'model', text: getWelcomeText(primaryTopic) }]);
  }, [tableInfo?.tableNo]);

  // Sync Audio Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Audio Play / Pause handler
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch(err => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
          setIsAudioLoading(false);
          showToast('Failed to start radio stream. Try another station!', 'error');
        });
    }
  };

  const handleSelectTrack = (index: number) => {
    if (index === currentTrackIndex && isPlaying) return;
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        setIsAudioLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsAudioLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsAudioLoading(false);
          });
      }
    }, 150);
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % RADIO_STREAMS.length;
    handleSelectTrack(nextIdx);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + RADIO_STREAMS.length) % RADIO_STREAMS.length;
    handleSelectTrack(prevIdx);
  };

  // Save changes to localStorage & scroll to bottom
  useEffect(() => {
    if (isLeftAiChatOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // Only save if we have a real table number to avoid cross-table chat contamination
    if (messages.length > 0 && tableInfo?.tableNo) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, isLeftAiChatOpen, activeTab]);

  // Focus input when opened & handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLeftAiChatOpen) {
        setIsLeftAiChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeftAiChatOpen, setIsLeftAiChatOpen]);

  const clearHistory = () => {
    const welcome = [
      {
        role: 'model' as const,
        text: getWelcomeText(primaryTopic),
      },
    ];
    setMessages(welcome);
    try {
      localStorage.removeItem(chatStorageKey);
    } catch (e) {}
    showToast('Conversation cleared', 'info');
  };

  // Helper to get follow-up suggestions based on user query
  const getFollowUpQuestions = (query: string): string[] => {
    const q = query.toLowerCase();
    if (q.includes('cricket') || q.includes('score') || q.includes('match')) {
      return [
        '🏏 Who is predicted to win today?',
        '🍟 What snacks pair best with the match?',
        '☕ What iced beverages keep you refreshed?'
      ];
    }
    if (q.includes('movie') || q.includes('film') || q.includes('cinema') || q.includes('trailer')) {
      return [
        '🎬 Tell me about Pushpa 2: The Rule records',
        '🍿 Best snacks for Bollywood movies?',
        '👻 Why is Stree 2 such a huge hit?'
      ];
    }
    if (q.includes('music') || q.includes('lo-fi') || q.includes('song') || q.includes('artist') || q.includes('track') || q.includes('playlist') || q.includes('acoustic') || q.includes('jazz')) {
      return [
        '🎵 Suggest top acoustic & Lo-Fi tracks',
        '🎸 Recommend Bollywood unplugged & indie songs',
        '🎷 Best relaxing café jazz melodies',
        '📻 Which radio station do you recommend right now?'
      ];
    }
    if (q.includes('spicy') || q.includes('fries') || q.includes('burger')) {
      return [
        '🥤 What cold drink cools down the spice?',
        '🍫 What sweet dessert balances spicy food?',
        '🔥 What is the most popular dish on the menu?'
      ];
    }
    return [
      '⭐ What are your top 3 chef recommendations?',
      '☕ Recommend a signature artisan coffee',
      '🎬 Tell me the latest Indian movie news'
    ];
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || input).trim();
    if (!rawQuery || isLoading) return;

    const lowerQuery = rawQuery.toLowerCase();

    // Check if user specifically asks to place or give an order in AI Mitra
    const isOrderIntent = 
      lowerQuery.includes('give order') || 
      lowerQuery.includes('place order') || 
      lowerQuery.includes('order now') || 
      lowerQuery.includes('submit order') ||
      lowerQuery.includes('confirm order') ||
      lowerQuery.startsWith('order ') ||
      lowerQuery.includes('i want to order');

    if (isOrderIntent) {
      const userMessage: ChatMessage = { role: 'user', text: rawQuery };
      setMessages(prev => [
        ...prev,
        userMessage,
        {
          role: 'model',
          text: `🍽️ To place your table order, please browse our full **Interactive Menu** right beside this chat! You can select any dishes, customize spice levels, and send them directly to the kitchen chef.\n\nI am your **AI Mitra** dining companion—feel free to ask me for taste recommendations, Indian cinema trivia, live cricket match analysis, or lo-fi café radio beats!`,
          followUps: [
            '🍿 What snacks pair best with Indian movies?',
            '🏏 What is the live cricket match score?',
            '☕ Which artisan coffee is a customer favorite?',
            '🍰 What dessert do you recommend today?'
          ]
        }
      ]);
      setInput('');
      return;
    }

    // Standard conversational AI query
    const userMessage: ChatMessage = { role: 'user', text: rawQuery };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const followUps = getFollowUpQuestions(rawQuery);
        setMessages(prev => [...prev, { role: 'model', text: data.reply, followUps }]);
      } else {
        throw new Error(data.error || 'Could not reach AI Mitra.');
      }
    } catch (err: any) {
      // Intelligent fallback
      let fallbackReply = `I am your dining companion! Feel free to ask me about Indian cinema blockbusters, live cricket action, café music, or culinary recommendations.`;
      const q = rawQuery.toLowerCase();
      if (q.includes('cricket') || q.includes('score') || q.includes('match')) {
        fallbackReply = `🏏 Right now in live cricket: India and top international series are delivering electrifying action! Ask me about specific team match equations or players!`;
      } else if (q.includes('movie') || q.includes('film') || q.includes('cinema')) {
        fallbackReply = `🎬 Indian cinema is on fire right now! From Pushpa 2's mass trailer breaking records to Stree 2's historic ₹600 Cr box office run and Kalki 2898 AD's epic universe, there's so much to talk about!`;
      } else if (q.includes('music') || q.includes('lo-fi') || q.includes('lofi') || q.includes('song') || q.includes('artist') || q.includes('track') || q.includes('playlist') || q.includes('acoustic') || q.includes('jazz') || q.includes('bollywood') || q.includes('indie') || q.includes('trending') || q.includes('new song')) {
        fallbackReply = `🎶 **Top Trending & New Songs (2025–2026) — AI Mitra's Picks:**\n\n🔥 **Bollywood Chartbusters:**\n• "Aaj Ki Raat" & "Aayi Nai" — *Stree 2* (Sachin-Jigar) — High-energy dance anthem!\n• "Tauba Tauba" — *Bad Newz* (Karan Aujla) — Global Punjabi viral beat\n• "Sajni Re" — *Laapataa Ladies* (Arijit Singh) — Pure acoustic romance\n• "Angaaron" — *Pushpa 2* (Shreya Ghoshal & DSP) — Folk-pop blockbuster\n• "Pehle Bhi Main" — *Animal* (Vishal Mishra) — Deep emotional melody\n\n✨ **Indie Pop Gems:**\n• "Jo Tum Mere Ho" & "Husn" — *Anuv Jain* — Warm acoustic & soul-stirring poetry\n• "Tu Hai Kahaan" — *AUR* — Mellow late-night chill vibes\n• "Ve Haaniyaan" — *Danny, Avvy Sra* — Melodious romantic acoustic\n• "Suniyan Suniyan" — *Juss x MixSingh* — Lo-fi chill pop\n\n🌟 **Global Hits:**\n• "Die With A Smile" — *Lady Gaga & Bruno Mars* — Classic soul & piano ballad\n• "Espresso" — *Sabrina Carpenter* — Funky viral café pop ☕\n• "Birds of a Feather" — *Billie Eilish* — Ethereal melodic chill\n\n👉 Check the **Music Feed** tab to explore all 15 tracks with filters and tune into our **6 Live Café Radio Stations**!`;
      }
      const followUps = getFollowUpQuestions(rawQuery);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: fallbackReply,
          followUps
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAboutNews = (news: TopicNewsItem, topicName: string) => {
    setActiveTab('chat');
    handleSendMessage(`Tell me more about this ${topicName} news: "${news.title}" and share interesting trivia about it!`);
  };

  const handleAskPrompt = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Helper for topic icons
  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'Cricket': return <Trophy className="w-3.5 h-3.5 text-amber-300" />;
      case 'Music': return <Music className="w-3.5 h-3.5 text-purple-300" />;
      case 'News': return <Newspaper className="w-3.5 h-3.5 text-blue-300" />;
      case 'Movies': return <Film className="w-3.5 h-3.5 text-indigo-300" />;
      case 'Games': return <Gamepad2 className="w-3.5 h-3.5 text-emerald-300" />;
      case 'Short Videos': return <Video className="w-3.5 h-3.5 text-rose-300" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  // Available topics for selectable questions (strictly derived from user's choice)
  const availableQuestionTopics = activeInterests.length > 0 
    ? activeInterests.filter(t => t !== 'AI Barista' && t !== 'AI Mitra') 
    : ['Music'];

  const currentQuestions = TOPIC_QUESTIONS[selectedQuestionTopic] || TOPIC_QUESTIONS[primaryTopic] || TOPIC_QUESTIONS.Music;

  // Tabs for the drawer: always [AI Chat] first, followed by topic feeds
  const availableTabs = [
    'chat',
    ...activeInterests.filter(t => t !== 'AI Barista' && t !== 'AI Mitra')
  ];

  if (!isLeftAiChatOpen) return null;

  return (
    <>
      {/* Hidden Audio Stream Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        preload="none" 
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setIsAudioLoading(false);
        }}
      />

      {/* Mobile Backdrop only (hidden on desktop so left AI Mitra and right Menu display together seamlessly) */}
      <div 
        onClick={() => setIsLeftAiChatOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Left AI Mitra Docked Panel (Left Side flush to window edge) */}
      <aside 
        className="fixed top-0 lg:top-[65px] bottom-0 left-0 z-30 w-full sm:w-[410px] xl:w-[430px] flex flex-col bg-white border-r border-slate-200/90 shadow-xl lg:shadow-xs transition-all duration-300 ease-in-out h-[100dvh] lg:h-[calc(100dvh-65px)]"
        role="dialog"
        aria-label="AI Mitra Chat"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white border-b border-purple-900/40 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-gold flex-shrink-0">
              <img 
                src="/ai_bot_logo.jpg" 
                alt="AI Mitra" 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide leading-tight text-white">AI Mitra</h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Live
                </span>
                {primaryTopic && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 truncate max-w-[100px]">
                    {primaryTopic}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-200/80 flex items-center gap-1 leading-tight">
                <Sparkles className="w-3 h-3 text-amber-300 flex-shrink-0" />
                <span>Table #{tableInfo?.tableNo || '1'} AI Companion</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-purple-200">
            {activeTab === 'chat' && (
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsLeftAiChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors ml-1"
              title="Close AI Mitra"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Tabs: [💬 AI Chat] [🏏 Cricket Feed] [🎵 Music Radio] */}
        <div className="flex items-center bg-slate-100/90 p-1.5 border-b border-slate-200 flex-shrink-0 gap-1.5 overflow-x-auto no-scrollbar">
          {availableTabs.map((tab) => {
            const isTabActive = activeTab === tab;
            const isChatTab = tab === 'chat';

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  isTabActive
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                {isChatTab ? (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Chat</span>
                  </>
                ) : (
                  <>
                    {getTopicIcon(tab)}
                    <span>{tab} Feed</span>
                    {tab === 'Music' && isPlaying && (
                      <div className="flex items-end gap-0.5 h-3 ml-0.5">
                        <span className="w-0.5 bg-emerald-300 animate-equalizer-1" />
                        <span className="w-0.5 bg-emerald-300 animate-equalizer-2" />
                        <span className="w-0.5 bg-emerald-300 animate-equalizer-3" />
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB: AI MITRA CHAT VIEW (AUTOMATIC SELECTABLE QUESTIONS & DIRECT ORDERING!)
        ========================================================================= */}
        {activeTab === 'chat' && (
          <>
            {/* If audio is playing while in chat, show mini player banner */}
            {isPlaying && (
              <div className="px-3.5 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between text-xs flex-shrink-0 border-b border-purple-800/50">
                <div className="flex items-center gap-2 truncate">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-amber-300 animate-equalizer-1" />
                    <span className="w-0.5 bg-amber-300 animate-equalizer-2" />
                    <span className="w-0.5 bg-amber-300 animate-equalizer-3" />
                  </div>
                  <span className="truncate text-[11px] font-semibold text-purple-100">
                    Playing: {currentTrack.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={togglePlay}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                    title="Pause"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                  <button
                    onClick={() => setActiveTab('Music')}
                    className="text-[10px] text-purple-300 hover:text-white underline font-medium"
                  >
                    Radio Hub
                  </button>
                </div>
              </div>
            )}

            {/* Smart Topic Header Bar (Real Cricket Live Score) */}
            {(primaryTopic === 'Cricket' || (!primaryTopic && activeCricketMatch)) && (
              <div className="px-3.5 py-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between text-xs flex-shrink-0 border-b border-blue-800/40">
                <div className="flex items-center gap-2 truncate min-w-0 mr-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCricketMatch?.isLive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className="font-bold text-white text-[11px] truncate">
                    {activeCricketMatch ? (
                      <>
                        <span className="text-amber-300 font-extrabold mr-1">{activeCricketMatch.team1.shortName}</span>
                        {activeCricketMatch.team1.fullScore && <span className="mr-1 text-slate-200">{activeCricketMatch.team1.fullScore}</span>}
                        <span className="text-slate-400 font-normal mr-1">vs</span>
                        <span className="text-amber-300 font-extrabold mr-1">{activeCricketMatch.team2.shortName}</span>
                        {activeCricketMatch.team2.fullScore && <span className="mr-1 text-slate-200">{activeCricketMatch.team2.fullScore}</span>}
                        <span className="text-emerald-300 font-medium ml-1">({activeCricketMatch.status})</span>
                      </>
                    ) : (
                      'Loading live cricket scores...'
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('Cricket')}
                  className="px-2 py-0.5 rounded-lg bg-blue-700/60 hover:bg-blue-600/60 text-[10px] font-bold text-amber-300 flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <span>Scorecard</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Smart Topic Header Bar (Movies Cinema Lounge Spotlight) */}
            {primaryTopic === 'Movies' && (
              <div className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between text-xs flex-shrink-0 border-b border-purple-800/40">
                <div className="flex items-center gap-2 truncate min-w-0 mr-2">
                  <Film className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-bold text-white text-[11px] truncate">
                    Cinema Lounge: <span className="text-amber-300 font-extrabold">{activeMovieClip.title}</span>
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('Movies')}
                  className="px-2 py-0.5 rounded-lg bg-purple-700/60 hover:bg-purple-600/60 text-[10px] font-bold text-amber-300 flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <span>Watch Clips</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Topic Category Switcher for Selectable Questions — auto-rotates every 20s */}
            <div className="bg-purple-50/80 border-b border-purple-100/70 flex-shrink-0">
              <div className="px-3.5 py-2 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Selectable Questions:</span>
                </span>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {availableQuestionTopics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedQuestionTopic(t)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        selectedQuestionTopic === t
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {t === 'Cricket' ? '🏏 Cricket' : t === 'Music' ? '🎵 Music' : t === 'Food' ? '🍔 Food' : t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Auto-rotate progress bar — resets every 20s */}
              <div className="h-0.5 bg-purple-100 overflow-hidden">
                <div
                  key={selectedQuestionTopic}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ animation: 'autoRotateBar 20s linear forwards' }}
                />
              </div>
            </div>
            <style>{`
              @keyframes autoRotateBar {
                from { width: 0%; }
                to   { width: 100%; }
              }
            `}</style>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 bg-slate-50/40">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5 animate-fade-in`}
                  >
                    <div
                      className={`flex items-start gap-2.5 max-w-[92%] ${
                        isUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-xs ${
                          isUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        }`}
                      >
                        {renderFormattedMessage(msg.text, isUser)}
                      </div>
                    </div>

                    {/* ✨ AUTOMATICALLY SHOW SELECTABLE QUESTION CARDS UNDER INITIAL WELCOME */}
                    {idx === 0 && !isUser && (
                      <div className="ml-9 mt-1.5 flex flex-col gap-2 max-w-[95%] w-full animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Tap any question to ask AI Mitra:
                          </span>
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            {selectedQuestionTopic}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                          {currentQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q.text)}
                              disabled={isLoading}
                              className="p-2.5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border border-purple-200/80 hover:border-purple-400 shadow-xs hover:shadow-sm text-left transition-all flex items-center justify-between gap-2.5 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-8 h-8 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-sm flex-shrink-0 transition-colors">
                                  {q.icon}
                                </span>
                                <div className="min-w-0">
                                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-md mb-0.5 border border-purple-200">
                                    {q.category}
                                  </span>
                                  <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-950 leading-snug">
                                    {q.text}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Selectable Questions under AI responses */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="ml-9 mt-1 flex flex-wrap gap-1.5 max-w-[92%]">
                        {msg.followUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSendMessage(fu)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-purple-100/70 border border-purple-200/90 text-purple-900 transition-all shadow-2xs hover:shadow-xs text-left"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-xs text-purple-700 animate-pulse ml-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                  </div>
                  <span className="font-medium">AI Mitra is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Persistent Quick Prompt Bar (Dynamically matching selected interest) */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Ask:
              </span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  activeInterests.length > 0
                    ? `Ask AI Mitra about ${activeInterests.join(', ')} & café pairings...`
                    : "Ask AI Mitra about coffee, desserts, music & recommendations..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-slate-900 placeholder:text-slate-400 transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center p-0 disabled:opacity-40 transition-all shadow-xs flex-shrink-0"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}

        {/* =========================================================================
            TAB: CRICKET FEED (REAL LIVE MATCHES & SCORECARD)
        ========================================================================= */}
        {activeTab === 'Cricket' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            {/* Real Match Filter / Selector Bar */}
            {cricketMatches.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {cricketMatches.map((m, mIdx) => {
                  const isSelected = mIdx === selectedCricketMatchIndex;
                  return (
                    <button
                      key={m.id || mIdx}
                      onClick={() => setSelectedCricketMatchIndex(mIdx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m.isLive ? (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                      <span>{m.team1.shortName} vs {m.team2.shortName}</span>
                      {m.isLive && (
                        <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-rose-500 text-white font-extrabold tracking-wider">
                          LIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Real Live Match Stadium Scorecard Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-500/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {activeCricketMatch?.isLive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Live Match • {activeCricketMatch.format} {activeCricketMatch.desc}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {activeCricketMatch?.state || 'Match'} • {activeCricketMatch?.format} {activeCricketMatch?.desc}
                    </>
                  )}
                </span>
                <span className="text-[10px] font-semibold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-400/30 truncate max-w-[170px]">
                  {activeCricketMatch?.venue || 'Live Stadium'}
                </span>
              </div>

              {/* Series Title */}
              <p className="text-[11px] font-medium text-slate-300/90 mb-2 truncate">
                {activeCricketMatch?.series || 'International Cricket Series'}
              </p>

              <div className="flex items-center justify-between py-2 border-y border-blue-800/40">
                <div>
                  <p className="text-xs font-bold text-slate-300">{activeCricketMatch?.team1.name || 'Team 1'}</p>
                  <h4 className="text-xl font-black text-white tracking-tight">
                    {activeCricketMatch?.team1.score || 'Yet to bat'}
                  </h4>
                  {activeCricketMatch?.team1.overs && (
                    <p className="text-[10px] text-emerald-400 font-semibold">{activeCricketMatch.team1.overs}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300">{activeCricketMatch?.team2.name || 'Team 2'}</p>
                  <h4 className="text-xl font-black text-white tracking-tight">
                    {activeCricketMatch?.team2.score || 'Yet to bat'}
                  </h4>
                  {activeCricketMatch?.team2.overs && (
                    <p className="text-[10px] text-amber-300 font-semibold">{activeCricketMatch.team2.overs}</p>
                  )}
                </div>
              </div>

              {/* Match Status / Equation */}
              <div className="mt-3 flex items-center justify-between text-xs text-blue-200/90">
                <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                  <span className="font-semibold text-amber-300 text-xs">
                    {activeCricketMatch?.status || 'Match in progress'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLiveCricket}
                    disabled={isLoadingCricket}
                    className="text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1 flex-shrink-0"
                    title="Refresh live score"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingCricket ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowCricketIframe(!showCricketIframe)}
                    className="text-[11px] font-bold text-amber-300 hover:text-white underline flex items-center gap-1"
                  >
                    {showCricketIframe ? 'Hide' : 'Full Board'}
                  </button>
                </div>
              </div>

              {/* Quick Prompt: Ask AI Mitra & order snacks */}
              {activeCricketMatch && (
                <div className="mt-3 pt-2.5 border-t border-blue-800/50 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(`What is the situation in ${activeCricketMatch.team1.shortName} vs ${activeCricketMatch.team2.shortName}? Tell me about the current match equation!`);
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    <span>💬 Discuss Match with AI Mitra</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Collapsible Live Stadium Widget Iframe */}
              {showCricketIframe && (
                <div className="mt-3 pt-3 border-t border-blue-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Live Stadium Feed
                    </span>
                    <button
                      onClick={() => setCricketRefreshKey(k => k + 1)}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Refresh widget"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full h-[220px] rounded-2xl overflow-hidden bg-slate-950 border border-blue-500/30">
                    <iframe
                      key={cricketRefreshKey}
                      src="https://widget.crictimes.org/"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="Live Cricket Stadium Feed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AI Cricket Headlines & Match News */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  Trending Cricket Headlines
                </h4>
                <button
                  onClick={() => fetchNewsForTopic('Cricket', true)}
                  disabled={isLoadingTopicNews.Cricket}
                  className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews.Cricket ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {isLoadingTopicNews.Cricket ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Curating cricket updates...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(topicNewsMap.Cricket || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                        <span className="text-slate-600 font-medium">{item.time}</span>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleAskAboutNews(item, 'Cricket')}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                        >
                          <span>💬 Discuss with AI Mitra</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MUSIC FEED (Lo-Fi Live Radio & Music News)
        ========================================================================= */}
        {activeTab === 'Music' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            {/* Live Lo-Fi Radio Player Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white border border-purple-500/30 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                    Live Café Radio
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentTrack.genre}
                </span>
              </div>

              {/* Track Info & Visualizer */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-800/60 border border-purple-400/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                  {currentTrack.cover}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-purple-200/80 truncate">
                    {currentTrack.artist}
                  </p>

                  {/* Equalizer Waveform */}
                  <div className="flex items-end gap-1 h-3.5 mt-2">
                    {[40, 75, 50, 90, 60, 85, 45, 95, 70, 50, 80, 65, 40, 90].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying 
                            ? 'bg-gradient-to-t from-purple-400 to-amber-300' 
                            : 'bg-purple-700/40'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(25, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                          animation: isPlaying ? `equalizerBounce ${0.5 + (i % 5) * 0.15}s ease-in-out infinite` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-800/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevTrack}
                    className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/40 transition-colors"
                    title="Previous Station"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    disabled={isAudioLoading}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-gold transition-all transform active:scale-95 disabled:opacity-50"
                    title={isPlaying ? 'Pause' : 'Play Live Lo-Fi'}
                  >
                    {isAudioLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5 fill-slate-900" />
                    ) : (
                      <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/40 transition-colors"
                    title="Next Station"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5 text-purple-200">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-purple-200" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseInt(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-purple-800/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Station Selector Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  Select Café Radio Station ({RADIO_STREAMS.length})
                </h5>
                <span className="text-[10px] text-purple-700 font-semibold">Tap to switch & play</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {RADIO_STREAMS.map((station, idx) => {
                  const isCurrent = currentTrackIndex === idx;
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-600 shadow-sm ring-2 ring-purple-300'
                          : 'bg-white hover:bg-purple-50/70 text-slate-800 border-slate-200/90 hover:border-purple-300 shadow-2xs'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{station.cover}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                          {station.title}
                        </p>
                        <p className={`text-[10px] truncate ${isCurrent ? 'text-purple-200' : 'text-slate-500'}`}>
                          {station.genre}
                        </p>
                      </div>
                      {isCurrent && isPlaying && (
                        <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                          <span className="w-0.5 bg-amber-300 animate-equalizer-1" />
                          <span className="w-0.5 bg-amber-300 animate-equalizer-2" />
                          <span className="w-0.5 bg-amber-300 animate-equalizer-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 🔥 LATEST & TRENDING NEW SONGS (2025-2026) */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Trending & New Songs (2025–2026)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {TRENDING_NEW_SONGS.length} Hit Tracks
                </span>
              </div>

              {/* Genre & Language Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(['All', 'Bollywood', 'Indie Pop', 'Global Hit'] as const).map((cat) => {
                  const isCatActive = selectedSongCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedSongCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isCatActive
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cat === 'All' ? '🔥 All Songs' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Songs List */}
              <div className="space-y-2">
                {TRENDING_NEW_SONGS
                  .filter(s => selectedSongCategory === 'All' || s.category === selectedSongCategory)
                  .map((song) => (
                    <div
                      key={song.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-lg flex-shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                            {song.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                                {song.title}
                              </h5>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/80 uppercase">
                                {song.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">
                              {song.artist} • <span className="font-medium text-slate-500">{song.movieOrAlbum}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-purple-700/90 font-semibold bg-purple-50/60 px-2 py-0.5 rounded-full">
                          Vibe: {song.vibe}
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`Tell me all about the hit song "${song.title}" by ${song.artist} from ${song.movieOrAlbum}! What makes it so trending, and what café beverage pairs with it?`);
                          }}
                          className="font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                        >
                          <span>💬 Ask AI Mitra</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Trending Music News */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-purple-600" />
                  Trending Music & Café Beats
                </h4>
                <button
                  onClick={() => fetchNewsForTopic('Music', true)}
                  disabled={isLoadingTopicNews.Music}
                  className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews.Music ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {isLoadingTopicNews.Music ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Tuning radio frequencies & news...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(topicNewsMap.Music || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {item.category}
                        </span>
                        <span className="text-slate-600 font-medium">{item.time}</span>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleAskAboutNews(item, 'Music')}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                        >
                          <span>💬 Discuss with AI Mitra</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MOVIES FEED (CINEMA LOUNGE, TRAILER CLIPS & AI NEWS)
        ========================================================================= */}
        {activeTab === 'Movies' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            {/* Movie Clip Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {MOVIE_CLIPS.map((clip, cIdx) => {
                const isSelected = cIdx === selectedMovieClipIndex;
                return (
                  <button
                    key={clip.id}
                    onClick={() => {
                      setSelectedMovieClipIndex(cIdx);
                      setShowMoviePlayer(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Film className="w-3 h-3 text-amber-400" />
                    <span>{clip.title.split(':')[0]}</span>
                    <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-extrabold ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900'
                        : clip.industry === 'Bollywood'
                        ? 'bg-rose-100 text-rose-800'
                        : clip.industry === 'South'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {clip.industryLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cinema Lounge Clip Player Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white border border-purple-500/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <Film className="w-3.5 h-3.5" />
                    Cinema Lounge
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider bg-white/10 text-purple-200 border border-white/20">
                    {activeMovieClip.industryLabel} • {activeMovieClip.genre}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-purple-200 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-400/30">
                  {activeMovieClip.year}
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {activeMovieClip.title}
              </h3>
              <p className="text-[11px] text-purple-200/80 mb-3 truncate">
                Directed by <strong>{activeMovieClip.director}</strong> • Starring {activeMovieClip.cast}
              </p>

              {/* YouTube Responsive Video Player */}
              {showMoviePlayer ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-purple-500/30 shadow-inner mb-3">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeMovieClip.youtubeId}?autoplay=0&rel=0`}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeMovieClip.title}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-800/40 text-center mb-3">
                  <button
                    onClick={() => setShowMoviePlayer(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-300" />
                    <span>Watch Movie Clip</span>
                  </button>
                </div>
              )}

              {/* AI Trivia & Café Pairing Block */}
              <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-purple-500/20 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-purple-100 leading-relaxed">
                    <strong>AI Mitra Trivia:</strong> {activeMovieClip.trivia}
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-purple-800/30">
                  <Coffee className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200 leading-relaxed">
                    <strong>Movie Pairing:</strong> {activeMovieClip.suggestedSnack}
                  </p>
                </div>
              </div>

              {/* Action: Ask AI Mitra */}
              <div className="mt-3 pt-2.5 border-t border-purple-800/50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    handleSendMessage(`Tell me all about ${activeMovieClip.title}! What makes this blockbuster so iconic across ${activeMovieClip.industryLabel}?`);
                  }}
                  className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 group"
                >
                  <span>💬 Discuss Movie with AI Mitra</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setShowMoviePlayer(!showMoviePlayer)}
                  className="text-[10px] text-purple-300 hover:text-white underline"
                >
                  {showMoviePlayer ? 'Hide Player' : 'Show Player'}
                </button>
              </div>
            </div>

            {/* Trending Cinema News & Headlines with Industry Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-purple-600" />
                    Real-Time Cinema News
                  </h4>
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-rose-50 text-[9px] font-extrabold text-rose-600 border border-rose-200 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <button
                  onClick={() => fetchNewsForTopic('Movies', true)}
                  disabled={isLoadingTopicNews.Movies}
                  className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews.Movies ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* 🌟 Industry Filter Tabs: All, Bollywood, South (Tollywood), Hollywood, Box Office */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { id: 'All', label: '🎬 All Cinema' },
                  { id: 'Bollywood', label: '🌟 Bollywood' },
                  { id: 'South', label: '🔥 South (Tollywood)' },
                  { id: 'Hollywood', label: '🍿 Hollywood' },
                  { id: 'Box Office', label: '💰 Box Office' }
                ].map(tab => {
                  const isActive = selectedMovieIndustry === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedMovieIndustry(tab.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {isLoadingTopicNews.Movies ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Curating real-time Bollywood, South & Hollywood news...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(() => {
                    const allMoviesNews = topicNewsMap.Movies || [];
                    const filtered = allMoviesNews.filter(item => {
                      if (selectedMovieIndustry === 'All') return true;
                      const ind = (item.industry || '').toLowerCase();
                      const cat = (item.category || '').toLowerCase();
                      const title = (item.title || '').toLowerCase();
                      const summary = (item.summary || '').toLowerCase();

                      if (selectedMovieIndustry === 'Bollywood') {
                        return ind.includes('bollywood') || cat.includes('bollywood') || cat.includes('hindi') || title.includes('stree') || title.includes('singham') || title.includes('khan') || title.includes('pathaan') || title.includes('ramayana') || title.includes('bhatt');
                      }
                      if (selectedMovieIndustry === 'South') {
                        return ind.includes('south') || cat.includes('south') || cat.includes('tollywood') || cat.includes('kollywood') || cat.includes('telugu') || cat.includes('tamil') || title.includes('pushpa') || title.includes('kalki') || title.includes('devara') || title.includes('allu') || title.includes('prabhas') || title.includes('coolie') || title.includes('thug') || title.includes('kantara');
                      }
                      if (selectedMovieIndustry === 'Hollywood') {
                        return ind.includes('hollywood') || cat.includes('hollywood') || title.includes('deadpool') || title.includes('nolan') || title.includes('avatar') || title.includes('dune') || title.includes('gladiator') || title.includes('marvel') || title.includes('universal') || title.includes('cameron');
                      }
                      if (selectedMovieIndustry === 'Box Office') {
                        return ind.includes('global') || cat.includes('box office') || title.includes('box office') || title.includes('collection') || title.includes('gross') || title.includes('cr') || summary.includes('box office') || summary.includes('gross');
                      }
                      return true;
                    });

                    const displayNews = filtered.length > 0 ? filtered : allMoviesNews;

                    return displayNews.map((item, idx) => {
                      const isBollywood = item.industry === 'Bollywood' || item.category?.toLowerCase().includes('bollywood');
                      const isSouth = item.industry === 'South' || item.category?.toLowerCase().includes('tollywood') || item.category?.toLowerCase().includes('south') || item.category?.toLowerCase().includes('kollywood');
                      const isHollywood = item.industry === 'Hollywood' || item.category?.toLowerCase().includes('hollywood');

                      const badgeStyle = isBollywood
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isSouth
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : isHollywood
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      const sourceName = item.source || (isBollywood ? 'Bollywood Hungama' : isSouth ? 'Cinema Express' : isHollywood ? 'Variety' : 'Box Office');

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all flex flex-col gap-2 group"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                                {item.category}
                              </span>
                              <span className="text-slate-400 font-medium text-[9px] uppercase tracking-wider">
                                • {sourceName}
                              </span>
                            </div>
                            <span className="text-slate-500 font-semibold">{item.time}</span>
                          </div>

                          <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                            {item.title}
                          </h5>

                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            {item.summary}
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => handleAskAboutNews(item, item.category || 'Movies')}
                              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                            >
                              <span>💬 Discuss with AI Mitra</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            GENERIC TOPIC TABS: News, Games, Short Videos
        ========================================================================= */}
        {activeTab !== 'chat' && activeTab !== 'Cricket' && activeTab !== 'Music' && activeTab !== 'Movies' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {getTopicIcon(activeTab)}
                Latest {activeTab} Feed
              </h4>
              <button
                onClick={() => fetchNewsForTopic(activeTab, true)}
                disabled={isLoadingTopicNews[activeTab]}
                className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews[activeTab] ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoadingTopicNews[activeTab] ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Gathering {activeTab} updates...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(topicNewsMap[activeTab] || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all flex flex-col gap-2 group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {item.category}
                      </span>
                      <span className="text-slate-600 font-medium">{item.time}</span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleAskAboutNews(item, activeTab)}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                      >
                        <span>💬 Discuss with AI Mitra</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
