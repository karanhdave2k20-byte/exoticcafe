const https = require('https');
const http = require('http');

let cachedMovieNews = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

// Helper to decode HTML entities and strip XML/HTML tags
function cleanHtml(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8230;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

// Convert publication date to friendly relative time string
function formatTimeAgo(dateStr) {
  try {
    const d = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (isNaN(diffMin) || diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Live';
  }
}

// Determine industry & category from title and description
function classifyMovieArticle(title, summary, defaultIndustry = 'Bollywood') {
  const combined = (title + ' ' + summary).toLowerCase();

  // Box office / Collections
  if (
    combined.includes('box office') ||
    combined.includes('day 1') ||
    combined.includes('day 2') ||
    combined.includes('day 3') ||
    combined.includes('crore') ||
    combined.includes('cr club') ||
    combined.includes('collection') ||
    combined.includes('worldwide gross')
  ) {
    let ind = defaultIndustry;
    if (combined.includes('hollywood') || combined.includes('dollar') || combined.includes('global')) ind = 'Hollywood';
    else if (combined.includes('telugu') || combined.includes('tamil') || combined.includes('malayalam') || combined.includes('kannada') || combined.includes('pushpa') || combined.includes('devara')) ind = 'South';
    else ind = 'Bollywood';

    return { industry: ind, category: 'Box Office' };
  }

  // South Indian Cinema (Tollywood, Kollywood, Mollywood, Sandalwood)
  if (
    combined.includes('telugu') ||
    combined.includes('tamil') ||
    combined.includes('malayalam') ||
    combined.includes('kannada') ||
    combined.includes('tollywood') ||
    combined.includes('kollywood') ||
    combined.includes('pushpa') ||
    combined.includes('kalki') ||
    combined.includes('devara') ||
    combined.includes('allu arjun') ||
    combined.includes('prabhas') ||
    combined.includes('rajinikanth') ||
    combined.includes('kamal haasan') ||
    combined.includes('jr ntr') ||
    combined.includes('ram charan') ||
    combined.includes('vijay') ||
    combined.includes('mohanlal') ||
    combined.includes('mammootty') ||
    combined.includes('yash') ||
    combined.includes('sukumar') ||
    combined.includes('anirudh') ||
    combined.includes('thug life') ||
    combined.includes('coolie')
  ) {
    const isKollywood = combined.includes('tamil') || combined.includes('kollywood') || combined.includes('rajinikanth') || combined.includes('vijay');
    return {
      industry: 'South',
      category: isKollywood ? 'Kollywood' : 'Tollywood'
    };
  }

  // Hollywood
  if (
    defaultIndustry === 'Hollywood' ||
    combined.includes('hollywood') ||
    combined.includes('marvel') ||
    combined.includes('deadpool') ||
    combined.includes('wolverine') ||
    combined.includes('nolan') ||
    combined.includes('avatar') ||
    combined.includes('dune') ||
    combined.includes('gladiator') ||
    combined.includes('oscar') ||
    combined.includes('emmy') ||
    combined.includes('broadway') ||
    combined.includes('netflix us') ||
    combined.includes('paramount') ||
    combined.includes('universal') ||
    combined.includes('warner bros')
  ) {
    return { industry: 'Hollywood', category: 'Hollywood' };
  }

  // Bollywood
  return { industry: 'Bollywood', category: 'Bollywood' };
}

// Fetch raw feed XML from URL with redirect support
function fetchXmlFeed(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchXmlFeed(res.headers.location).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve('');
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', () => resolve(''));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve('');
    });
  });
}

// Parse items from RSS XML
function parseRssItems(xmlText, sourceName, defaultIndustry) {
  if (!xmlText) return [];
  const items = [];
  const itemMatches = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const match of itemMatches) {
    const block = match[1];

    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    const title = cleanHtml(titleMatch ? titleMatch[1] : '');
    const summary = cleanHtml(descMatch ? descMatch[1] : '');
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

    if (title && title.length > 5) {
      const { industry, category } = classifyMovieArticle(title, summary, defaultIndustry);
      
      // Shorten summary to 2 punchy sentences if long
      let cleanSummary = summary;
      if (cleanSummary.length > 220) {
        const periodIdx = cleanSummary.indexOf('.', 120);
        if (periodIdx !== -1 && periodIdx < 250) {
          cleanSummary = cleanSummary.slice(0, periodIdx + 1);
        } else {
          cleanSummary = cleanSummary.slice(0, 200) + '...';
        }
      }

      items.push({
        title,
        summary: cleanSummary || `${title} - Full coverage and entertainment updates.`,
        category,
        industry,
        source: sourceName,
        time: formatTimeAgo(pubDate)
      });
    }
  }

  return items;
}

// Main fetcher: combines real-time RSS from Indian Express, Hindustan Times, and Deadline
async function fetchRealTimeMovieNews(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedMovieNews.length > 0 && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedMovieNews;
  }

  try {
    const [ieXml, htXml, deadlineXml] = await Promise.all([
      fetchXmlFeed('https://indianexpress.com/section/entertainment/feed/'),
      fetchXmlFeed('https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml'),
      fetchXmlFeed('https://deadline.com/feed/')
    ]);

    const ieItems = parseRssItems(ieXml, 'Indian Express', 'Bollywood');
    const htItems = parseRssItems(htXml, 'Hindustan Times', 'Bollywood');
    const deadlineItems = parseRssItems(deadlineXml, 'Deadline Hollywood', 'Hollywood');

    // Merge and deduplicate by title similarity
    const all = [];
    const seenTitles = new Set();

    const addUnique = (item) => {
      const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
      if (!seenTitles.has(normalized)) {
        seenTitles.add(normalized);
        all.push(item);
      }
    };

    // Interleave sources so patron sees a diverse mix of Bollywood, South, Hollywood & Box office
    const maxLen = Math.max(ieItems.length, htItems.length, deadlineItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (ieItems[i]) addUnique(ieItems[i]);
      if (deadlineItems[i]) addUnique(deadlineItems[i]);
      if (htItems[i]) addUnique(htItems[i]);
    }

    if (all.length > 0) {
      cachedMovieNews = all.slice(0, 24);
      lastFetchTime = now;
      console.log(`[REAL-TIME MOVIE NEWS] Successfully loaded ${cachedMovieNews.length} live entertainment stories!`);
      return cachedMovieNews;
    }
  } catch (err) {
    console.warn('[REAL-TIME MOVIE NEWS] Failed to fetch live feeds:', err.message);
  }

  // If live fetch fails, return cached if any, otherwise return default curated
  if (cachedMovieNews.length > 0) return cachedMovieNews;

  return [
    {
      title: "Pushpa 2: The Rule Mass Trailer Shatters All-Time Indian Digital Records",
      summary: "Allu Arjun's electrifying swagger, jaw-dropping stunts, and Devi Sri Prasad's thunderous BGM cross 150M+ views across all Indian languages in 24 hours.",
      category: "Tollywood",
      industry: "South",
      source: "Cinema Express",
      time: "15m ago"
    },
    {
      title: "Stree 2 Creates History: Crosses ₹600 Cr Net to Become All-Time Biggest Hindi Hit",
      summary: "Shraddha Kapoor and Rajkummar Rao's blockbuster horror-comedy universe dominates box office charts for weeks, sparking wild anticipation for Stree 3.",
      category: "Bollywood",
      industry: "Bollywood",
      source: "Bollywood Hungama",
      time: "40m ago"
    },
    {
      title: "Deadpool & Wolverine Storms Past $1.3B Global Box Office Benchmark",
      summary: "Marvel's R-rated multiversal smash-hit continues breaking theatrical records worldwide as audiences celebrate Hugh Jackman's comic suit return.",
      category: "Hollywood",
      industry: "Hollywood",
      source: "Variety",
      time: "1h ago"
    },
    {
      title: "Kalki 2898 AD Sequel Pre-Production Begins with Prabhas & Amitabh Bachchan",
      summary: "Director Nag Ashwin teases expanded Mahabharata lore, ground-breaking dystopian VFX, and Kamal Haasan's Yaskin taking central command.",
      category: "Tollywood",
      industry: "South",
      source: "Pinkvilla",
      time: "2h ago"
    },
    {
      title: "Christopher Nolan’s Next IMAX Feature Confirmed for Summer 2026 Release",
      summary: "Universal Pictures officially slots the Oscar-winning director's next highly classified feature for July 2026, with Matt Damon in talks to headline.",
      category: "Hollywood",
      industry: "Hollywood",
      source: "Deadline",
      time: "3h ago"
    },
    {
      title: "Singham Again Roars with Record Pre-Bookings Across India",
      summary: "Rohit Shetty's mega cop universe extravaganza unites Ajay Devgn, Kareena Kapoor, Ranveer Singh, Akshay Kumar, Deepika Padukone, and Tiger Shroff for a grand spectacle.",
      category: "Bollywood",
      industry: "Bollywood",
      source: "Filmfare",
      time: "4h ago"
    },
    {
      title: "Jr NTR's Devara & Rajinikanth's Coolie Generate Massive Theatrical Frenzy",
      summary: "Anirudh Ravichander's pulse-pounding background scores and high-octane action sequences send fans into celebrations across single screens and multiplexes.",
      category: "South Cinema",
      industry: "South",
      source: "The Hindu Cinema",
      time: "5h ago"
    },
    {
      title: "James Cameron Unveils 'Avatar: Fire & Ash' Volcanic Pandora Concept Art",
      summary: "The legendary filmmaker teases the aggressive Ash Clan and groundbreaking 3D visuals as production pushes boundaries ahead of its worldwide launch.",
      category: "Hollywood",
      industry: "Hollywood",
      source: "Hollywood Reporter",
      time: "6h ago"
    }
  ];
}

module.exports = {
  fetchRealTimeMovieNews
};
