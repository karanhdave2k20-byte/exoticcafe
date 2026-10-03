'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, Mic, Star, Flame, Clock, Heart, Plus, Minus, 
  SlidersHorizontal, Sparkles, Filter, ChevronDown, Coffee, 
  Sparkle, Check, MessageSquare, User, Zap 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MenuItem, ItemCustomization } from '../../types';
import Modal from '../../components/Modal';
import BackButton from '../../components/BackButton';

export default function MenuPage() {
  const { 
    mockMenu, cart, addToCart, updateQuantity, 
    isPureVeg, favorites, toggleFavorite, showToast, tableInfo 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [selectedTag, setSelectedTag] = useState<'all' | 'bestseller' | 'new' | 'promo'>('all');
  const [maxPrice, setMaxPrice] = useState(600);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // AI Mood Matchmaker State
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Dish Customization Modal State
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [customMilk, setCustomMilk] = useState<any>('Standard Dairy');
  const [customSweetness, setCustomSweetness] = useState<any>('Regular (100%)');
  const [customTemp, setCustomTemp] = useState<any>('Hot');
  const [extraShot, setExtraShot] = useState(false);
  const [whippedCrema, setWhippedCrema] = useState(false);
  const [baristaNote, setBaristaNote] = useState('');
  const [forGuest, setForGuest] = useState<string>('');

  const categories = ['All', 'Starters', 'Main Course', 'Pizza', 'Burger', 'Sandwich', 'Beverages', 'Desserts', 'Combos'];

  const moodBundles: Record<string, { title: string; subtitle: string; items: string[]; price: number; desc: string }> = {
    'Work Focus': {
      title: 'Artisan Espresso + Avocado Truffle Toast',
      subtitle: '⚡ High Focus & Sustained Energy',
      items: ['Artisan Espresso', 'Avocado Toast & Truffle Poached Egg'],
      price: 470,
      desc: 'Double shot antioxidant caffeine burst paired with rich healthy fats on sourdough.',
    },
    'Cozy Date': {
      title: 'Golden Cappuccino + Vanilla Bean Cheesecake',
      subtitle: '🥐 Romantic & Sweet Table Indulgence',
      items: ['Golden Crema Cappuccino', 'Vanilla Bean Cheesecake'],
      price: 600,
      desc: 'Velvety micro-foam cappuccino dusted in Valrhona cocoa with creamy vanilla bean cheesecake.',
    },
    'Clean Bites': {
      title: 'Avocado Toast + Iced Salted Caramel',
      subtitle: '🥗 Nutritious & Refreshingly Balanced',
      items: ['Avocado Toast & Truffle Poached Egg', 'Iced Salted Caramel Frappé'],
      price: 600,
      desc: 'Organic seed sourdough with Haas avocados and cold-dripped artisan caramel frappe.',
    },
    'Decadent Sweet': {
      title: 'Toasted Hazelnut Latte + Fudge Brownie',
      subtitle: '🍫 Ultimate Belgian Chocolate Bliss',
      items: ['Toasted Hazelnut Latte', 'Dark Chocolate Fudge Brownie'],
      price: 520,
      desc: 'Roasted hazelnut infusion with molten 70% dark Belgian cocoa ganache brownie.',
    },
  };

  const handleAddMoodBundle = (moodKey: string) => {
    const bundle = moodBundles[moodKey];
    if (!bundle) return;
    const matchingDishes = mockMenu.filter(m => bundle.items.includes(m.name));
    matchingDishes.forEach(d => addToCart(d, undefined, 'Table Share'));
    showToast(`Added "${bundle.title}" combo to your order! 🎁`, 'success');
  };

  // Open customization modal
  const openDishModal = (dish: MenuItem) => {
    setSelectedDish(dish);
    setCustomMilk('Standard Dairy');
    setCustomSweetness('Regular (100%)');
    setCustomTemp(dish.type === 'cold' ? 'Over Ice (+₹15)' : 'Hot');
    setExtraShot(false);
    setWhippedCrema(false);
    setBaristaNote('');
    setForGuest(tableInfo?.guestNames?.[0] || 'Me');
  };

  const handleAddToCartWithCustomization = () => {
    if (!selectedDish) return;
    let additionalPrice = 0;
    if (customMilk.includes('+₹30')) additionalPrice += 30;
    if (customMilk.includes('+₹40')) additionalPrice += 40;
    if (customMilk.includes('+₹25')) additionalPrice += 25;
    if (customTemp.includes('+₹15')) additionalPrice += 15;
    if (extraShot) additionalPrice += 40;
    if (whippedCrema) additionalPrice += 30;

    const customization: ItemCustomization = {
      milk: customMilk,
      sweetness: customSweetness,
      temperature: customTemp,
      extraShot,
      whippedCrema,
      note: baristaNote.trim(),
      additionalPrice,
    };

    addToCart(selectedDish, customization, forGuest);
    setSelectedDish(null);
  };

  // Voice Search Handler
  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search not supported in this browser.', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => showToast('Listening for dishes...', 'info');
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      showToast(`Searching for "${transcript}"`, 'success');
    };
    recognition.start();
  };

  // Filtering & Sorting
  const filteredMenu = useMemo(() => {
    return mockMenu.filter(item => {
      if (isPureVeg && !item.isVeg) return false;
      if (activeCategory !== 'All' && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (selectedTag === 'bestseller' && !item.isBestSeller) return false;
      if (selectedTag === 'new' && !item.isNew) return false;
      if (selectedTag === 'promo' && (!item.discount || item.discount <= 0)) return false;
      if (item.price > maxPrice) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.desc.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [mockMenu, isPureVeg, activeCategory, selectedTag, maxPrice, searchQuery, sortBy]);

  const getItemQuantity = (id: number) => {
    return cart.filter(c => c.id === id).reduce((sum, item) => sum + item.quantity, 0);
  };

  // Calculate modal dynamic total
  const modalComputedPrice = useMemo(() => {
    if (!selectedDish) return 0;
    let sum = selectedDish.price;
    if (customMilk.includes('+₹30')) sum += 30;
    if (customMilk.includes('+₹40')) sum += 40;
    if (customMilk.includes('+₹25')) sum += 25;
    if (customTemp.includes('+₹15')) sum += 15;
    if (extraShot) sum += 40;
    if (whippedCrema) sum += 30;
    return sum;
  }, [selectedDish, customMilk, customTemp, extraShot, whippedCrema]);

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <BackButton href="/preference" label="Back" />
      </div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search artisan cappuccino, sourdough pizza, desserts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-11 pr-11 py-3 rounded-full text-sm shadow-sm"
          />
          <button
            onClick={startVoiceSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-caramel-600 transition-colors"
            title="Search by Voice"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold glass-card transition-all ${
            showFilterDrawer ? 'border-caramel-500 text-caramel-700' : 'text-roast-900'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-caramel-600" />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Expanded Filter Tray */}
      {showFilterDrawer && (
        <div className="glass-card p-5 rounded-3xl border border-warm-border flex flex-col gap-4 animate-slide-down text-xs bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted font-bold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted font-bold mr-1">Tags:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'bestseller', label: '⭐ Best Sellers' },
                { id: 'new', label: '🔥 New Roasts' },
                { id: 'promo', label: '🏷️ Deals' },
              ].map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id as any)}
                  className={`px-3 py-1 rounded-full font-bold transition-all border ${
                    selectedTag === tag.id
                      ? 'bg-caramel-600 text-white border-caramel-600 shadow-sm'
                      : 'bg-white text-muted border-warm-border hover:border-caramel-500'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted font-bold">Max Price:</span>
              <span className="font-bold text-caramel-700 font-mono">₹{maxPrice}</span>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-caramel-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* NEW FEATURE: AI Mood Table Matchmaker */}
      <div className="glass-card p-5 rounded-3xl border border-caramel-500/30 bg-gradient-to-r from-[#FFFDF9] via-warm-subtle to-[#FFFDF9] shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-caramel-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-roast-900 leading-none">
                AI Table Sommelier
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Select your table mood for curated pairing recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Mood Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(moodBundles).map(([key, data]) => {
            const isSelected = selectedMood === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMood(isSelected ? null : key)}
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-caramel-500 text-white border-caramel-600 shadow-sm'
                    : 'bg-white border-warm-border hover:border-caramel-500 text-roast-900'
                }`}
              >
                <span className="text-xs font-bold">{key}</span>
                <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                  {data.subtitle.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expanded Active Mood Bundle Card */}
        {selectedMood && moodBundles[selectedMood] && (
          <div className="p-4 rounded-2xl bg-white border border-caramel-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-down">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-caramel-700 block">
                {moodBundles[selectedMood].subtitle}
              </span>
              <h4 className="font-serif font-bold text-base text-roast-900">
                {moodBundles[selectedMood].title}
              </h4>
              <p className="text-xs text-muted mt-0.5 max-w-md">
                {moodBundles[selectedMood].desc}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="font-mono text-lg font-black text-caramel-700">
                ₹{moodBundles[selectedMood].price}
              </span>
              <button
                onClick={() => handleAddMoodBundle(selectedMood)}
                className="btn-primary py-2 px-5 text-xs font-bold shadow-gold"
              >
                <span>Add Pair</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-caramel-600 text-white border-caramel-600 shadow-gold scale-105'
                  : 'glass-card border-warm-border text-muted hover:text-roast-900 hover:border-caramel-500 bg-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Menu Dishes Grid */}
      {filteredMenu.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 glass-card rounded-3xl p-8 bg-white">
          <Coffee className="w-12 h-12 text-caramel-600/40" />
          <h3 className="text-lg font-bold text-roast-900">No dishes found</h3>
          <p className="text-xs text-muted max-w-xs">
            Adjust your search query or reset filters to discover our delicious options.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
              setSelectedTag('all');
              setMaxPrice(1000);
            }}
            className="btn-secondary text-xs mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMenu.map(dish => {
            const quantity = getItemQuantity(dish.id);
            const isFav = favorites.includes(dish.id);

            return (
              <div
                key={dish.id}
                onClick={() => openDishModal(dish)}
                className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-warm-border hover:border-caramel-500/60 cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-glass bg-white relative"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-44 bg-[#F6F0E6] overflow-hidden">
                  <Image
                    src={dish.img}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span 
                      className={`w-4 h-4 rounded-md border flex items-center justify-center p-0.5 bg-white/95 backdrop-blur-md shadow-sm ${
                        dish.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                      title={dish.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
                    >
                      <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>

                    {dish.isBestSeller && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-caramel-500 text-white shadow-sm">
                        Best Seller
                      </span>
                    )}

                    {dish.discount && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                        {dish.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dish.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-muted hover:text-rose-500 transition-colors shadow-sm"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-rose-600 fill-rose-600' : ''}`} />
                  </button>

                  {/* Rating & Prep ribbon */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md font-bold">
                      <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>{dish.rating}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{dish.prepTime}m</span>
                      {dish.calories && <span>• {dish.calories}</span>}
                    </div>
                  </div>
                </div>

                {/* Dish Description & Price */}
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-roast-900 group-hover:text-caramel-700 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                      {dish.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-warm-border mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted uppercase font-bold">Price</span>
                      <span className="text-lg font-black text-caramel-700 font-mono">
                        ₹{dish.price.toFixed(2)}
                      </span>
                    </div>

                    {dish.isAvailable === false ? (
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-[11px] border border-gray-200">
                        Sold Out
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDishModal(dish);
                        }}
                        className="btn-primary py-2 px-4 text-xs font-bold shadow-gold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW FEATURE: Full Dish Customization Modal */}
      <Modal
        isOpen={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        title={selectedDish?.name}
        maxWidth="max-w-lg"
      >
        {selectedDish && (
          <div className="flex flex-col gap-4 text-roast-900">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-[#F6F0E6]">
              <Image
                src={selectedDish.img}
                alt={selectedDish.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                selectedDish.isVeg ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-rose-500 text-rose-700 bg-rose-50'
              }`}>
                {selectedDish.isVeg ? 'Vegetarian' : 'Non-Veg'}
              </span>

              <div className="flex items-center gap-1 text-sm font-bold text-caramel-600">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{selectedDish.rating} / 5.0</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              {selectedDish.desc}
            </p>

            {/* Customization 1: Milk Choice (for coffees/drinks) */}
            {selectedDish.category === 'Coffee' && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-warm-border">
                <label className="text-xs font-bold text-roast-900 flex items-center justify-between">
                  <span>Choice of Milk</span>
                  <span className="text-[10px] text-muted">Specialty dairy or plant-based</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Standard Dairy', 'Oat Milk (+₹30)', 'Almond Milk (+₹40)', 'Soy Milk (+₹25)'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMilk(m)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                        customMilk === m
                          ? 'bg-caramel-50 border-caramel-600 text-caramel-700 font-bold'
                          : 'bg-white border-warm-border text-muted'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization 2: Sweetness */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-warm-border">
              <label className="text-xs font-bold text-roast-900">Sweetness Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['Sugar-Free', 'Mild (50%)', 'Regular (100%)'].map(sw => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setCustomSweetness(sw)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      customSweetness === sw
                        ? 'bg-caramel-50 border-caramel-600 text-caramel-700 font-bold'
                        : 'bg-white border-warm-border text-muted'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization 3: Barista Add-ons */}
            {selectedDish.category === 'Coffee' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-warm-border">
                <label className="text-xs font-bold text-roast-900">Crafting Add-ons</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraShot}
                      onChange={(e) => setExtraShot(e.target.checked)}
                      className="accent-caramel-600 w-4 h-4"
                    />
                    <span>Extra Espresso Shot (+₹40)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whippedCrema}
                      onChange={(e) => setWhippedCrema(e.target.checked)}
                      className="accent-caramel-600 w-4 h-4"
                    />
                    <span>Chantilly Crema (+₹30)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Customization 4: Assign to Seated Companion */}
            {tableInfo?.guestNames && tableInfo.guestNames.length > 1 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-warm-border">
                <label className="text-xs font-bold text-roast-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-caramel-600" />
                  <span>Tag Item for Seated Guest:</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {tableInfo.guestNames.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForGuest(name)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                        forGuest === name
                          ? 'bg-caramel-500 text-white border-caramel-600'
                          : 'bg-white border-warm-border text-muted'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes to Kitchen */}
            <div className="pt-2 border-t border-warm-border">
              <input
                type="text"
                placeholder="Special instruction (e.g. Less ice, extra hot, no cinnamon)..."
                value={baristaNote}
                onChange={(e) => setBaristaNote(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            {/* Price and Add Button */}
            <div className="flex items-center justify-between pt-4 border-t border-warm-border mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted uppercase font-bold">Total with Options</span>
                <span className="text-2xl font-black text-caramel-700 font-mono">
                  ₹{modalComputedPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddToCartWithCustomization}
                className="btn-primary py-3 px-6 text-xs font-bold shadow-gold"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Table Order</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
