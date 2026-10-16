'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, User, Trash2, Sparkles, Coffee, 
  Loader2, Plus, Check, Music, Play, Pause, 
  SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, 
  Newspaper, Headphones, ArrowRight, MessageSquare, Radio,
  Trophy, Film, Gamepad2, Video, ChevronDown, ChevronUp,
  ExternalLink, Flame, Zap, HelpCircle, Compass
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MenuItem } from '../types';

interface ChatMessage {
  role: 'user' | 'model' | 'ai';
  text: string;
  followUps?: string[];
}

interface TopicNewsItem {
  title: string;
  summary: string;
  category: string;
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

const STORAGE_KEY = 'tablehive_ai_chat_history';

const RADIO_STREAMS: RadioTrack[] = [
  { id: 'lofi', title: 'Chill Lounge & Lo-Fi', artist: 'I Love Radio', genre: 'Lo-Fi Chill', cover: '☕', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'ambient', title: 'Ambient Rain & Chill', artist: 'SomaFM DefCon', genre: 'Ambient Chill', cover: '🌧️', url: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'acoustic', title: 'Acoustic Morning Blend', artist: 'Chillout Lounge', genre: 'Acoustic Blend', cover: '🥐', url: 'https://streams.ilovemusic.de/iloveradio14.mp3' },
  { id: 'space', title: 'Deep Space Downtempo', artist: 'SomaFM Space Station', genre: 'Ambient Chill', cover: '✨', url: 'https://ice1.somafm.com/spacestation-128-mp3' },
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
    { text: "Recommend the best coffee pairings for acoustic lo-fi vibes", icon: "☕", category: "Acoustic Pairing" },
    { text: "Does sound frequency enhance dark chocolate & espresso sweetness?", icon: "🎧", category: "Flavor Science" },
    { text: "Tell me about the global lo-fi café trend in artisan coffeehouses", icon: "📰", category: "Trend" },
    { text: "What's our café's most relaxing dessert to enjoy with jazz?", icon: "🍰", category: "Dessert Match" },
    { text: "Suggest upbeat snacks for an acoustic morning blend", icon: "🥐", category: "Morning Blend" },
  ],
  News: [
    { text: "What are today's top world, culinary & technology headlines?", icon: "📰", category: "Top Stories" },
    { text: "How is sustainable organic coffee farming evolving in 2026?", icon: "🌱", category: "Environment" },
    { text: "Tell me about next-gen AI assistants in restaurant dining", icon: "🤖", category: "Technology" },
    { text: "What are the latest global farm-to-table culinary trends?", icon: "🍽️", category: "Culinary" },
  ],
  Movies: [
    { text: "Which blockbuster movies and trailers are breaking records today?", icon: "🎬", category: "Box Office" },
    { text: "What café snacks and desserts go best with movie discussions?", icon: "🍿", category: "Movie Pairing" },
    { text: "Tell me about recent film festival winners and cinematic trivia", icon: "🏆", category: "Trivia" },
    { text: "Recommend a cozy warm drink for talking about classic cinema", icon: "☕", category: "Beverage" },
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

export default function LeftAiChatDrawer() {
  const { 
    isLeftAiChatOpen, 
    setIsLeftAiChatOpen, 
    showToast, 
    mockMenu, 
    addToCart,
    tableInfo,
    currentSession
  } = useStore();

  // Extract all table interests
  const activeInterests: string[] = (tableInfo?.interests && tableInfo.interests.length > 0)
    ? tableInfo.interests
    : (currentSession?.interests && currentSession.interests.length > 0)
    ? currentSession.interests
    : [];

  const primaryTopic = activeInterests[0] || 'Cricket';

  // In AI Mitra, default activeTab to 'chat' so questions and conversations are immediately visible!
  const [activeTab, setActiveTab] = useState<string>('chat');
  // Selected question topic tab inside chat (e.g. Cricket, Music, Food)
  const [selectedQuestionTopic, setSelectedQuestionTopic] = useState<string>(primaryTopic || 'Cricket');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio Radio State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Universal Topic News State (Cached per topic)
  const [topicNewsMap, setTopicNewsMap] = useState<Record<string, TopicNewsItem[]>>({});
  const [isLoadingTopicNews, setIsLoadingTopicNews] = useState<Record<string, boolean>>({});

  // Cricket Specific State
  const [showCricketIframe, setShowCricketIframe] = useState(false);
  const [cricketRefreshKey, setCricketRefreshKey] = useState(0);

  const currentTrack = RADIO_STREAMS[currentTrackIndex];

  // Sync selected question topic with active interest
  useEffect(() => {
    if (primaryTopic) {
      setSelectedQuestionTopic(primaryTopic);
    }
  }, [primaryTopic]);

  // Fetch Topic News
  const fetchNewsForTopic = async (topic: string, force = false) => {
    if (!force && topicNewsMap[topic] && topicNewsMap[topic].length > 0) return;
    
    setIsLoadingTopicNews(prev => ({ ...prev, [topic]: true }));
    try {
      const res = await fetch(`/api/ai/topic-news?topic=${encodeURIComponent(topic)}`);
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
        return `🏏 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected Cricket, I'm your live match companion! What would you like to know about today's match, live scores, and café pairings?`;
      case 'Music':
        return `🎵 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected Music, I've loaded our café's live Lo-Fi radio and today's trending music news for you! What music vibes or coffee pairings would you like to explore?`;
      case 'News':
        return `📰 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected News, I've gathered today's top global, tech, and culinary headlines for you!`;
      case 'Movies':
        return `🎬 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected Movies, I've queued up today's box office buzz and cinema headlines for you!`;
      case 'Games':
        return `🎮 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected Games, I've prepared table challenges, trivia quizzes and snack pairings for you!`;
      case 'Short Videos':
        return `📱 Welcome to Table ${tableInfo.tableNo || 'Hive'}! Since your table selected Short Videos, let's explore viral barista latte art and trending café reels!`;
      default:
        return `Hello! I am your Exotic AI Mitra. Ask me anything about coffee roasts, dish pairings, spicy bites, or what to order today!`;
    }
  };

  // Load chat history on mount & update welcome if topic changed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      setMessages([
        {
          role: 'model',
          text: getWelcomeText(primaryTopic),
        },
      ]);
    } catch (e) {}
  }, [primaryTopic]);

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
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, isLeftAiChatOpen, activeTab]);

  // Handle ESC key to close
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
    const welcome: ChatMessage[] = [
      {
        role: 'model',
        text: getWelcomeText(primaryTopic),
      },
    ];
    setMessages(welcome);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
    } catch (e) {}
    showToast('Conversation cleared', 'info');
  };

  // Helper to get follow-up suggestions based on user query
  const getFollowUpQuestions = (query: string): string[] => {
    const q = query.toLowerCase();
    if (q.includes('cricket') || q.includes('score') || q.includes('match')) {
      return [
        '🍟 Add Peri-Peri Fries for the match?',
        '🏆 Who is predicted to win today?',
        '☕ What iced beverages keep you refreshed?'
      ];
    }
    if (q.includes('music') || q.includes('lo-fi') || q.includes('song')) {
      return [
        '🍰 Which dessert pairs with lo-fi beats?',
        '☕ Tell me about Golden Crema Cappuccino',
        '🎧 How does sound change taste?'
      ];
    }
    if (q.includes('spicy') || q.includes('fries') || q.includes('burger')) {
      return [
        '🥤 What cold drink cools down the spice?',
        '🍫 Add Chocolate Brownie for dessert?',
        '🔥 What is the spiciest dish on the menu?'
      ];
    }
    return [
      '⭐ What are your top 3 chef recommendations?',
      '☕ Recommend a signature coffee roast',
      '🧀 Tell me about Truffle Avocado Toast'
    ];
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: query };
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
        const followUps = getFollowUpQuestions(query);
        setMessages(prev => [...prev, { role: 'model', text: data.reply, followUps }]);
      } else {
        throw new Error(data.error || 'Could not reach AI Mitra.');
      }
    } catch (err: any) {
      // Fallback smart reply if Google API is congested
      let fallbackReply = `Our kitchen is sizzling! Peri-Peri Fries and Artisan Espresso are always ready for your table.`;
      const q = query.toLowerCase();
      if (q.includes('cricket') || q.includes('score') || q.includes('match')) {
        fallbackReply = `🏏 Right now in the thrilling IND vs AUS 3rd T20I at Eden Gardens: India is 188/4 in 18.2 overs, needing just 14 runs from 10 balls! Shubman Gill (68*) and Hardik Pandya (32*) are batting with immense power! For these final overs, our hot Peri-Peri Fries (₹160) and loaded Nachos make the ultimate match companion!`;
      } else if (q.includes('music') || q.includes('lo-fi')) {
        fallbackReply = `🎵 Our café's Lo-Fi Lounge is playing live! Smooth acoustic and jazz chords naturally heighten taste receptors for dark chocolate and espresso crema. Try pairing our Toasted Hazelnut Latte with a warm Chocolate Fudge Brownie!`;
      }
      const followUps = getFollowUpQuestions(query);
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
    handleSendMessage(`Tell me more about this ${topicName} news: "${news.title}" and suggest delicious café pairings to enjoy while reading it!`);
  };

  const handleAskPrompt = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Find dishes mentioned in the message text
  const getDishesMentioned = (text: string): MenuItem[] => {
    if (!mockMenu || mockMenu.length === 0) return [];
    const lower = text.toLowerCase();
    return mockMenu.filter(dish => {
      const name = dish.name.toLowerCase();
      if (lower.includes(name)) return true;
      if (name.includes('fries') && lower.includes('fries')) return true;
      if (name.includes('cheesecake') && lower.includes('cheesecake')) return true;
      if (name.includes('brownie') && lower.includes('brownie')) return true;
      if (name.includes('margherita') && lower.includes('margherita')) return true;
      if (name.includes('espresso') && lower.includes('espresso')) return true;
      if (name.includes('cappuccino') && lower.includes('cappuccino')) return true;
      if (name.includes('latte') && lower.includes('latte')) return true;
      return false;
    }).slice(0, 2);
  };

  const handleQuickAddDish = (dish: MenuItem) => {
    addToCart(dish);
    setAddedItemIds(prev => [...prev, dish.id]);
    showToast(`Added ${dish.name} to cart!`, 'success');
    setTimeout(() => {
      setAddedItemIds(prev => prev.filter(id => id !== dish.id));
    }, 2000);
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

  // Available topics for selectable questions
  const availableQuestionTopics = [
    ...(activeInterests.length > 0 ? activeInterests.filter(t => t !== 'AI Barista' && t !== 'AI Mitra') : ['Cricket', 'Music']),
    'Food'
  ];

  const currentQuestions = TOPIC_QUESTIONS[selectedQuestionTopic] || TOPIC_QUESTIONS.Cricket || TOPIC_QUESTIONS.Food;

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

      {/* Mobile Backdrop */}
      <div 
        onClick={() => setIsLeftAiChatOpen(false)}
        className="fixed inset-0 bg-slate-900/10 z-40 lg:hidden transition-opacity"
        aria-hidden="true"
      />

      {/* Left Chat Docked Panel */}
      <aside 
        className="fixed top-0 lg:top-[61px] bottom-0 left-0 z-40 w-full sm:w-[440px] flex flex-col bg-white border-r border-slate-200/90 shadow-xl transition-all duration-300 ease-in-out h-[100dvh] lg:h-[calc(100dvh-61px)] animate-slide-right"
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

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide">
                  AI Mitra
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
                {primaryTopic && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    {primaryTopic}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-purple-200/80 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Gemini • Exotic Café Companion
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
                    <span>AI Chat & Questions</span>
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
            TAB: AI MITRA CHAT VIEW (AUTOMATICALLY SHOWS SELECTABLE QUESTIONS!)
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

            {/* Smart Topic Header Bar (with quick jump to Scorecard or Feed) */}
            {primaryTopic === 'Cricket' && (
              <div className="px-3.5 py-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between text-xs flex-shrink-0 border-b border-blue-800/40">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                  <span className="font-bold text-white text-[11px] truncate">
                    IND vs AUS • 188/4 (18.2 ov) • Need 14 in 10b
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('Cricket')}
                  className="px-2 py-0.5 rounded-lg bg-blue-700/60 hover:bg-blue-600/60 text-[10px] font-bold text-amber-300 flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <span>Stadium Widget</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Topic Category Switcher for Selectable Questions */}
            <div className="px-3.5 py-2 bg-purple-50/80 border-b border-purple-100/70 flex items-center justify-between text-xs flex-shrink-0">
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

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 bg-slate-50/40">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const dishes = !isUser ? getDishesMentioned(msg.text) : [];

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
                        {msg.text}
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

                    {/* Interactive Dish Cards (if recommended by AI) */}
                    {dishes.length > 0 && (
                      <div className="ml-9 mt-0.5 flex flex-col gap-1.5 max-w-[88%] w-full">
                        {dishes.map(dish => {
                          const isAdded = addedItemIds.includes(dish.id);
                          return (
                            <div
                              key={dish.id}
                              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-purple-200 shadow-xs hover:border-purple-400 transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className="truncate">
                                  <p className="font-semibold text-xs text-slate-900 truncate">{dish.name}</p>
                                  <p className="text-[11px] text-purple-700 font-bold">₹{dish.price}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleQuickAddDish(dish)}
                                disabled={isAdded}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all flex-shrink-0 ${
                                  isAdded 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Follow-up Selectable Questions under AI responses */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="ml-9 mt-1 flex flex-wrap gap-1.5 max-w-[90%]">
                        {msg.followUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSendMessage(fu)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <span>{fu}</span>
                            <ArrowRight className="w-3 h-3 text-purple-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-900 bg-white border border-purple-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[85%] shadow-xs ml-9">
                  <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                  <span>AI Mitra is crafting recommendations...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips (Above Text Input) */}
            <div 
              className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 flex-shrink-0 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Ask:
              </span>
              {currentQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q.text)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
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
                placeholder={`Ask AI Mitra about ${selectedQuestionTopic.toLowerCase()}, scores, menu...`}
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
            TAB: CRICKET FEED (Live Match Scoreboard & News)
        ========================================================================= */}
        {activeTab === 'Cricket' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            {/* Live Stadium Match Scorecard Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-500/30 shadow-md flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    Live Stadium Match Scoreboard
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  3rd T20I • Live Feed
                </span>
              </div>

              {/* Match Score Overview */}
              <div className="flex items-center justify-between border-b border-blue-800/40 pb-2.5">
                <div>
                  <h3 className="text-base font-black text-white tracking-wide">
                    IND vs AUS
                  </h3>
                  <p className="text-xs text-blue-200/90 font-semibold mt-0.5">
                    IND 188/4 (18.2 ov) • Need 14 runs in 10 balls
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    CRR: 10.25
                  </span>
                  <p className="text-[10px] text-blue-300 font-semibold">Target: 202</p>
                </div>
              </div>

              {/* Batting & Bowling Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-900/40 p-2.5 rounded-xl border border-blue-700/30">
                  <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">🏏 Batting</p>
                  <p className="font-bold text-white truncate mt-1">S. Gill 68* (40)</p>
                  <p className="font-bold text-white truncate">H. Pandya 32* (16)</p>
                </div>
                <div className="bg-blue-900/40 p-2.5 rounded-xl border border-blue-700/30">
                  <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">⚾ Bowling</p>
                  <p className="font-bold text-white truncate mt-1">P. Cummins</p>
                  <p className="text-[11px] text-blue-200 font-mono">3.2-0-32-1</p>
                </div>
              </div>

              {/* Toggle Live Stadium Feed */}
              <div className="pt-1 flex items-center justify-between border-t border-blue-800/40">
                <button
                  onClick={() => setShowCricketIframe(!showCricketIframe)}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
                >
                  <span>{showCricketIframe ? 'Hide Real-Time Stadium Widget' : 'View Real-Time Stadium Scoreboard'}</span>
                  {showCricketIframe ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    setCricketRefreshKey(k => k + 1);
                    fetchNewsForTopic('Cricket', true);
                    showToast('Cricket scores & news refreshed! 🏏', 'info');
                  }}
                  className="p-1.5 rounded-lg bg-blue-800/50 hover:bg-blue-700/50 text-blue-200 transition-colors"
                  title="Refresh Scores"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {showCricketIframe && (
                <div className="w-full h-80 rounded-2xl overflow-hidden border border-blue-700/50 bg-white mt-1">
                  <iframe
                    key={cricketRefreshKey}
                    src="https://widget.crictimes.org/"
                    className="w-full h-full border-0"
                    title="Live Cricket Stadium Feed"
                  />
                </div>
              )}
            </div>

            {/* Trending Cricket News Headlines */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Trending Cricket Headlines
                  </h3>
                </div>

                <button
                  onClick={() => fetchNewsForTopic('Cricket', true)}
                  disabled={isLoadingTopicNews['Cricket']}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews['Cricket'] ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTopicNews['Cricket'] && (!topicNewsMap['Cricket'] || topicNewsMap['Cricket'].length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span>Curating live cricket headlines with Gemini...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(topicNewsMap['Cricket'] || []).map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.category === 'Match Update' 
                            ? 'bg-blue-100 text-blue-700' 
                            : item.category === 'Record'
                            ? 'bg-amber-100 text-amber-800'
                            : item.category === 'Analysis'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.time}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleAskAboutNews(item, 'Cricket')}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ask AI Mitra about this</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cricket Discussion & Snack Prompts */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Match Matchmaker Prompts
              </span>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Cheer with table pairings and cricket banter:
              </p>
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  '🏏 Who holds the fastest century in T20 cricket history?',
                  '🍟 What spicy snacks go best with a last-over chase?',
                  '🏆 Predict today\'s match winner with AI Mitra!'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskPrompt(prompt)}
                    className="text-left text-[11px] font-medium p-2 rounded-xl bg-white hover:bg-blue-100/70 border border-blue-200/60 text-blue-900 transition-all flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
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
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 accent-amber-400 h-1 bg-purple-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Station Quick Switchers */}
              <div className="flex gap-1.5 mt-3 pt-2 overflow-x-auto no-scrollbar">
                {RADIO_STREAMS.map((station, idx) => (
                  <button
                    key={station.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1 transition-all flex-shrink-0 ${
                      currentTrackIndex === idx
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60'
                    }`}
                  >
                    <span>{station.cover}</span>
                    <span>{station.genre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Music News Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Trending Music News
                  </h3>
                </div>

                <button
                  onClick={() => fetchNewsForTopic('Music', true)}
                  disabled={isLoadingTopicNews['Music']}
                  className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTopicNews['Music'] ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTopicNews['Music'] && (!topicNewsMap['Music'] || topicNewsMap['Music'].length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <span>Curating latest music headlines with Gemini...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(topicNewsMap['Music'] || []).map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.category === 'Trending' 
                            ? 'bg-purple-100 text-purple-700' 
                            : item.category === 'Live'
                            ? 'bg-rose-100 text-rose-700'
                            : item.category === 'Awards'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.time}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleAskAboutNews(item, 'Music')}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ask AI Mitra about this</span>
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
            GENERIC TOPIC VIEW: NEWS / MOVIES / GAMES / SHORT VIDEOS
        ========================================================================= */}
        {activeTab !== 'Cricket' && activeTab !== 'Music' && activeTab !== 'chat' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
            {/* Topic Header Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner">
                  {getTopicIcon(activeTab)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {activeTab} Headlines
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-indigo-200/80">
                    Live AI-curated {activeTab.toLowerCase()} updates for your table
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchNewsForTopic(activeTab, true)}
                disabled={isLoadingTopicNews[activeTab]}
                className="p-2 rounded-xl bg-indigo-800/40 hover:bg-indigo-700/40 text-indigo-200 transition-colors"
                title="Refresh Topic News"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTopicNews[activeTab] ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* News Articles List */}
            {isLoadingTopicNews[activeTab] && (!topicNewsMap[activeTab] || topicNewsMap[activeTab].length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span>Loading latest {activeTab.toLowerCase()} headlines...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(topicNewsMap[activeTab] || []).map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleAskAboutNews(item, activeTab)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Ask AI Mitra about this</span>
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
