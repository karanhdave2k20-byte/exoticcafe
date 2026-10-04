'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Film, Clock, Eye, Sparkles } from 'lucide-react';
import Modal from '../../../components/Modal';

interface ShortFilm {
  id: string;
  title: string;
  genre: string;
  duration: string;
  desc: string;
  thumbnail: string;
  videoUrl: string;
}

const films: ShortFilm[] = [
  { id: '1', title: 'Satisfying Espresso ASMR', genre: 'Food & Drink', duration: '0:58', desc: 'The perfect bottomless portafilter extraction.', thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' },
  { id: '2', title: 'Top 5 Hidden Gems in Kyoto', genre: 'Travel', duration: '0:45', desc: 'Explore these secret spots on your next trip to Japan.', thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/9BqIq-L-9O4' },
  { id: '3', title: 'When your cat thinks it is a dog', genre: 'Animals & Pets', duration: '0:32', desc: 'Hilarious compilation of confused felines playing fetch.', thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw' },
  { id: '4', title: 'Gordon Ramsay 60-Second Steak', genre: 'Cooking', duration: '1:00', desc: 'Watch the master chef sear a perfect ribeye in one minute.', thumbnail: 'https://images.unsplash.com/photo-1544025162-811114bd47d5?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/Wch3gJG2IG4' },
  { id: '5', title: 'Insane Street Dance Battle', genre: 'Music & Dance', duration: '0:55', desc: 'Wait for the final flip, you will not believe your eyes!', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ' },
  { id: '6', title: 'Unboxing the Future: Glass Phone', genre: 'Technology', duration: '0:50', desc: 'First look at the transparent smartphone prototype.', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/V-_O7nl0Ii0' },
  { id: '7', title: 'Extreme Mountain Bike Downhill', genre: 'Sports', duration: '0:59', desc: 'POV footage going 40mph down a rocky cliff face.', thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/1oB1oDrDkHM' },
  { id: '8', title: 'Try Not To Laugh Challenge', genre: 'Comedy', duration: '0:48', desc: 'The best standup crowd work clips of the week.', thumbnail: 'https://images.unsplash.com/photo-1527224857830-43a7ebb8545e?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/9BqIq-L-9O4' },
  { id: '9', title: 'I Painted My Room with Magic Ink', genre: 'Art & DIY', duration: '0:53', desc: 'This heat-reactive paint completely changes color when you touch it.', thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' },
  { id: '10', title: 'The Most Beautiful Aurora Borealis', genre: 'Nature', duration: '0:40', desc: 'Breathtaking 4K drone footage over Iceland.', thumbnail: 'https://images.unsplash.com/photo-1531366936337-77b5d3d5231c?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/V-_O7nl0Ii0' },
  { id: '11', title: 'How to Build a Custom Mechanical Keyboard', genre: 'Tech & DIY', duration: '1:00', desc: 'Lubing switches, custom keycaps, and the ultimate ASMR sound test.', thumbnail: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/1oB1oDrDkHM' },
  { id: '12', title: 'Baking the Ultimate Fudgy Brownies', genre: 'Food & Drink', duration: '0:45', desc: 'This secret ingredient makes them ridiculously chocolatey.', thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', videoUrl: 'https://www.youtube.com/embed/Wch3gJG2IG4' }
];

export default function FilmsPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Auto-advance logic based on parsed duration
  React.useEffect(() => {
    if (!playingId) return;

    const currentFilmIndex = films.findIndex(f => f.id === playingId);
    if (currentFilmIndex === -1) return;

    const film = films[currentFilmIndex];
    // parse duration e.g. "0:58" -> 58 seconds
    const [mins, secs] = film.duration.split(':').map(Number);
    const durationMs = (mins * 60 + secs) * 1000;

    const timer = setTimeout(() => {
      // Auto advance to next film
      const nextIndex = (currentFilmIndex + 1) % films.length;
      const nextId = films[nextIndex].id;
      setPlayingId(nextId);
      
      // Auto scroll the container to center the new video
      const nextElement = document.getElementById(`film-card-${nextId}`);
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, durationMs + 1000); // add 1 second buffer for video loading

    return () => clearTimeout(timer);
  }, [playingId]);

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6 animate-fade-in h-[85vh]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Endless Feed
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            TableHive Shorts
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Shorts Grid */}
      <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 h-full items-center">
        {films.map(film => (
          <div
            id={`film-card-${film.id}`}
            key={film.id}
            className="snap-center shrink-0 w-[300px] h-[550px] glass-card rounded-3xl overflow-hidden border border-warm-border hover:border-caramel-500 transition-all duration-300 shadow-glass flex flex-col bg-white relative group"
          >
            {playingId === film.id ? (
              <div className="w-full h-full bg-black relative">
                <iframe
                  src={`${film.videoUrl}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1`}
                  title={film.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full absolute inset-0 object-cover"
                  style={{ minHeight: '100%', minWidth: '100%', objectFit: 'cover' }}
                />
                <button 
                  onClick={() => setPlayingId(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative cursor-pointer" onClick={() => {
                  setPlayingId(film.id);
                  const el = document.getElementById(`film-card-${film.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                }}>
                <img
                  src={film.thumbnail}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform border border-white/30">
                    <Play className="w-8 h-8 ml-1 fill-white text-white" />
                  </div>
                </div>

                {/* Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5 text-white">
                  <span className="text-[10px] uppercase font-black tracking-widest text-caramel-400 drop-shadow-md">
                    {film.genre}
                  </span>
                  <h3 className="font-serif font-bold text-xl leading-tight text-white drop-shadow-md">
                    {film.title}
                  </h3>
                  <p className="text-[11px] text-gray-200 line-clamp-2 mt-1 drop-shadow-md leading-relaxed">
                    {film.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-mono bg-black/60 px-2 py-1 rounded-full backdrop-blur-md border border-white/10 text-caramel-300">
                      <Clock className="w-3 h-3" />
                      <span>{film.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
