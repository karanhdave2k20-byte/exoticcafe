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

export default function NewsPage() {
  const [language, setLanguage] = useState('English');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const languages = [
    { label: 'English', code: 'en-IN', ceid: 'IN:en', lang: 'en' },
    { label: 'Hindi', code: 'hi', ceid: 'IN:hi', lang: 'hi' },
    { label: 'Gujarati', code: 'gu', ceid: 'IN:gu', lang: 'gu' }
  ];

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchNews = async () => {
      try {
        const langInfo = languages.find(l => l.label === language) || languages[0];
        const rssUrl = `https://news.google.com/rss?hl=${langInfo.code}&gl=IN&ceid=${langInfo.ceid}`;
        // Using rss2json to easily parse RSS feed on the client
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (isMounted && data.items) {
          const formattedNews = data.items.map((item: any) => {
            // Calculate time ago
            const pubDate = new Date(item.pubDate);
            const now = new Date();
            const diffMs = now.getTime() - pubDate.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));
            let timeStr = `${diffMins}m ago`;
            if (diffHrs > 0) timeStr = `${diffHrs}h ago`;
            
            return {
              id: item.guid || item.link,
              category: 'Top Stories',
              title: item.title,
              summary: item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : '',
              time: timeStr,
              source: item.source || 'Google News',
              link: item.link
            };
          }).slice(0, 10); // Show top 10

          setNewsData(formattedNews);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setIsLoading(false);
      }
    };

    fetchNews();
    return () => { isMounted = false; };
  }, [language]);

  return (
    <div className="max-w-3xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Real-Time Updates
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Global News Feed
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Language Pills */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {languages.map(lang => (
          <button
            key={lang.label}
            onClick={() => setLanguage(lang.label)}
            className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shadow-sm ${
              language === lang.label
                ? 'bg-caramel-600 text-white border-caramel-600 shadow-gold'
                : 'glass-card border-warm-border bg-white text-roast-800 hover:border-caramel-400'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Articles Stream */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-caramel-200 border-t-caramel-600 animate-spin"></div>
          </div>
        ) : (
          newsData.map(news => (
            <a
              key={news.id}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-5 rounded-3xl border border-warm-border bg-white hover:border-caramel-500 transition-all shadow-sm flex flex-col gap-2 group block"
            >
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span className="px-2.5 py-0.5 rounded-full bg-caramel-500/10 text-caramel-700 font-bold border border-caramel-500/20 uppercase tracking-widest">
                  {language} News
                </span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-caramel-600" />
                  <span>{news.time}</span>
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg text-roast-900 group-hover:text-caramel-700 transition-colors mt-1">
                {news.title}
              </h3>

              <div className="flex items-center justify-between text-[11px] text-muted pt-3 border-t border-warm-border mt-1">
                <span className="font-semibold text-caramel-700">Source: {news.source}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted group-hover:text-caramel-600">
                  Read full story <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
