import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Check, Sparkles, Filter, Leaf, ChevronRight } from 'lucide-react';
import { MenuItem, CartItem } from '../types';

interface MenuScreenProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  tableNumber: number;
  userName: string;
  onOpenTableModal: () => void;
  onGoToCart: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  menuItems,
  cart,
  addToCart,
  removeFromCart,
  tableNumber,
  userName,
  onOpenTableModal,
  onGoToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category || 'Mains')));
    return ['All', ...cats];
  }, [menuItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchVeg = !vegOnly || item.isVeg;
      return matchCat && matchSearch && matchVeg;
    });
  }, [menuItems, selectedCategory, searchQuery, vegOnly]);

  const getItemQuantity = (item: MenuItem) => {
    const id = item.id || item._id;
    const found = cart.find((c) => (c.item.id || c.item._id) === id);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalCartAmount = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Table & Session Header Pill */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-50 to-amber-100/40 border border-brand-200/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            #{tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">TableHive Café</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-600">
              Welcome, <span className="font-bold text-brand-700">{userName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTableModal}
          className="text-xs font-bold text-brand-700 bg-white hover:bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
        >
          <span>Change</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search & Veg Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pizza, hazelnut latte, fries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500 shadow-2xs"
          />
        </div>

        {/* Categories Bar & Pure Veg Pill */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer ${
              vegOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full border border-emerald-300 bg-emerald-400" />
            <span>Pure Veg</span>
          </button>

          {categories.map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-bold text-slate-800">
          {selectedCategory === 'All' ? 'All Dishes' : selectedCategory} ({filteredItems.length})
        </span>
        <span className="text-[11px] text-brand-600 font-semibold">TableHive Freshly Made</span>
      </div>

      {/* Dishes Grid / List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const qty = getItemQuantity(item);
          const itemId = item.id || item._id || item.name;

          return (
            <div
              key={itemId}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex gap-3.5 items-center group"
            >
              {/* Authentic Food Photo */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 shadow-inner">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to default coffee image if custom image fails
                    (e.target as HTMLImageElement).src = '/cappuccino.png';
                  }}
                />
                {/* Veg / Non-Veg Badge */}
                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs p-1 rounded-sm shadow-xs">
                  <div
                    className={`w-2.5 h-2.5 rounded-full border ${
                      item.isVeg
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-rose-600 bg-rose-600'
                    }`}
                  />
                </div>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">
                    {item.name}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {item.desc || 'Artisanal recipe prepared fresh in TableHive kitchen.'}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-sm text-slate-900">
                    ₹{item.price}
                  </span>

                  {/* Add / Quantity Button */}
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 font-extrabold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-brand-700 text-white px-2 py-0.5 rounded-xl shadow-xs">
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="p-1 hover:bg-brand-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="font-black text-xs min-w-[12px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="p-1 hover:bg-brand-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating View Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={onGoToCart}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm shadow-xl flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">
                {totalCartCount} {totalCartCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span>₹{totalCartAmount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>View Cart & Bill</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
