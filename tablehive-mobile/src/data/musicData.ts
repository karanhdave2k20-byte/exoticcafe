import { TrendingSong, RadioStation } from '../types';

export const TRENDING_SONGS: TrendingSong[] = [
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

export const CAFE_RADIO_STATIONS: RadioStation[] = [
  {
    id: 'lofi-beats',
    title: 'TableHive Lo-Fi Lounge',
    genre: 'Chillhop & Ambient Beats',
    cover: '🎧',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    desc: 'Soft instrumental beats designed for deep table conversations & coffee sips.'
  },
  {
    id: 'coffeehouse-acoustic',
    title: 'Acoustic Coffeehouse',
    genre: 'Unplugged Guitar & Indie Melodies',
    cover: '☕',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    desc: 'Gentle acoustic strumming, piano ballads, and peaceful vocal harmonies.'
  },
  {
    id: 'smooth-jazz',
    title: 'Artisan Jazz & Sax',
    genre: 'Classic Café Jazz & Soul',
    cover: '🎷',
    streamUrl: 'https://streaming.exclusive.radio/er/smoothjazz/icecast.audio',
    desc: 'Velvety saxophone chords and warm vintage upright bass notes.'
  },
  {
    id: 'bollywood-chill',
    title: 'Bollywood Unplugged Chill',
    genre: 'Acoustic Desi Melodies',
    cover: '🎸',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    desc: 'Acoustic Hindi covers, romantic guitar versions, and indie unplugged vibes.'
  },
  {
    id: 'deep-house',
    title: 'Sunset Café Deep Groove',
    genre: 'Melodic Deep House',
    cover: '🌅',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    desc: 'Uplifting modern café electronic grooves that keep the dining vibe lively.'
  },
  {
    id: 'piano-meditation',
    title: 'Peaceful Piano Haven',
    genre: 'Minimalist Acoustic Piano',
    cover: '🎹',
    streamUrl: 'https://streaming.exclusive.radio/er/smoothjazz/icecast.audio',
    desc: 'Calm reflective piano notes that relieve stress while enjoying dessert.'
  }
];
