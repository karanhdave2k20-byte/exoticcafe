'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Newspaper, Clock, ExternalLink, Bookmark, Sparkles } from 'lucide-react';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  time: string;
  source: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    category: 'Coffee & Gastronomy',
    title: 'Geisha Beans from Panama Break Global Auction Records at $10,000/kg',
    summary: 'Specialty coffee roasters around the world celebrate the delicate floral jasmine and bergamot notes of high-altitude volcanic harvests.',
    time: '18m ago',
    source: 'World Coffee Gazette',
  },
  {
    id: '2',
    category: 'Technology & AI',
    title: 'Autonomous Precision Brewing: Next-Gen Espresso Machines Master Micro-Fluidics',
    summary: 'New temperature-zoned extraction pumps dynamically adjust bar pressure mid-shot to maximize crema yield and minimize bitter chlorogenic acids.',
    time: '45m ago',
    source: 'TechPulse Café',
  },
  {
    id: '3',
    category: 'Culture & Lifestyle',
    title: 'The Resurgence of Café Society: Collaborative Dining Takes Over Urban Centers',
    summary: 'From Tokyo to Milan, guests are ditching isolated mobile screens for shared QR carts, collaborative playlist queues, and interactive dining.',
    time: '2h ago',
    source: 'Urban Living Daily',
  },
  {
    id: '4',
    category: 'Sustainability',
    title: 'Zero-Waste Coffee Roasteries Turn Used Grounds into Eco-Concrete and Plant Fertilizer',
    summary: 'Groundbreaking circular economy initiatives eliminate thousands of tons of organic waste while providing nitrogen-rich soil to community gardens.',
    time: '3h ago',
    source: 'Green Earth Review',
  },
];

export default function NewsPage() {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Coffee & Gastronomy', 'Technology & AI', 'Culture & Lifestyle', 'Sustainability'];

  const filteredNews = newsData.filter(item => filter === 'All' || item.category === filter);

  return (
    <div className="max-w-3xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Curated Press
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Café & World Digest
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filter === cat
                ? 'bg-caramel-500 text-white border-caramel-600 shadow-sm'
                : 'glass-card border-warm-border bg-white text-roast-800 hover:border-caramel-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Stream */}
      <div className="flex flex-col gap-4">
        {filteredNews.map(news => (
          <div
            key={news.id}
            className="glass-card p-5 rounded-3xl border border-warm-border bg-white hover:border-caramel-500 transition-all shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="px-2.5 py-0.5 rounded-full bg-caramel-500/10 text-caramel-700 font-bold border border-caramel-500/20">
                {news.category}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-caramel-600" />
                <span>{news.time}</span>
              </div>
            </div>

            <h3 className="font-serif font-bold text-lg text-roast-900 hover:text-caramel-700 transition-colors cursor-pointer mt-1">
              {news.title}
            </h3>

            <p className="text-xs text-muted leading-relaxed">
              {news.summary}
            </p>

            <div className="flex items-center justify-between text-[11px] text-muted pt-3 border-t border-warm-border mt-1">
              <span className="font-semibold text-caramel-700">Source: {news.source}</span>
              <span className="text-[10px] text-muted">Read in 2 mins</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
