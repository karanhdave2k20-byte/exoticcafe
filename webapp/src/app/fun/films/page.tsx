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
  {
    id: '1',
    title: 'The Artisan Roast of Kyoto',
    genre: 'Cinematic Documentary',
    duration: '4:20',
    desc: 'An intimate journey into the ancient roasteries of Kyoto where third-generation master baristas roast single-batch heirloom beans.',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: '2',
    title: 'Morning Rain in Montmartre',
    genre: 'Visual Poetry',
    duration: '3:15',
    desc: 'Warm croissants, cobblestones glistening with autumn rain, and the gentle chatter of early Parisian morning patrons.',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: '3',
    title: 'Symphony of Sourdough',
    genre: 'Culinary Art',
    duration: '5:40',
    desc: 'Slow-motion 60fps capture of levain sourdough folding, blistered thin crust blistering, and the unmistakable sound of crisp crumb.',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];

export default function FilmsPage() {
  const [selectedFilm, setSelectedFilm] = useState<ShortFilm | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Cinema Lounge
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Curated Short Films
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Films Showcase List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {films.map(film => (
          <div
            key={film.id}
            onClick={() => setSelectedFilm(film)}
            className="glass-card rounded-3xl overflow-hidden border border-warm-border hover:border-caramel-500 cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-glass flex flex-col justify-between bg-white"
          >
            <div className="relative w-full h-48 bg-warm-subtle overflow-hidden">
              <img
                src={film.thumbnail}
                alt={film.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-caramel-500 text-white flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-roast-900 flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3 text-caramel-600" />
                <span>{film.duration}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-caramel-700 block mb-1">
                  {film.genre}
                </span>
                <h3 className="font-serif font-bold text-base text-roast-900 group-hover:text-caramel-700 transition-colors">
                  {film.title}
                </h3>
                <p className="text-xs text-muted mt-1.5 line-clamp-3 leading-relaxed">
                  {film.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-caramel-600 pt-3 border-t border-warm-border mt-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Watch Short Film</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      <Modal
        isOpen={selectedFilm !== null}
        onClose={() => setSelectedFilm(null)}
        title={selectedFilm?.title}
        maxWidth="max-w-2xl"
      >
        {selectedFilm && (
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                src={selectedFilm.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-caramel-700">
                {selectedFilm.genre} • {selectedFilm.duration}
              </span>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {selectedFilm.desc}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
