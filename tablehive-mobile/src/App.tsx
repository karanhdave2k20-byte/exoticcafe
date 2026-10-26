import React, { useState, useEffect, useRef } from 'react';
import { TabType, BottomNav } from './components/BottomNav';
import { MenuScreen } from './components/MenuScreen';
import { CartScreen } from './components/CartScreen';
import { AiMitraScreen } from './components/AiMitraScreen';
import { MusicRadioScreen } from './components/MusicRadioScreen';
import { CricketScreen } from './components/CricketScreen';
import { TableSelectorModal } from './components/TableSelectorModal';
import { MenuItem, CartItem, RadioStation, TrendingSong } from './types';
import { CAFE_RADIO_STATIONS } from './data/musicData';

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Crispy Peri-Peri Fries', category: 'Sides', price: 160, isVeg: true, image: '/fries.jpg', desc: 'Crispy golden potato fries tossed in spicy African peri-peri herb blend.' },
  { id: '2', name: 'Wood-fired Margherita Pizza', category: 'Pizza', price: 299, isVeg: true, image: '/margherita_pizza.jpg', desc: 'San Marzano tomato sauce, fresh mozzarella & sweet basil.' },
  { id: '3', name: 'Creamy Penne Alfredo', category: 'Pasta', price: 280, isVeg: true, image: '/penne_alfredo.jpg', desc: 'Al dente penne in rich parmesan garlic cream sauce.' },
  { id: '4', name: 'Artisan Cappuccino', category: 'Coffee', price: 180, isVeg: true, image: '/cappuccino.png', desc: 'Freshly pulled espresso with velvety foam and cocoa dusting.' },
  { id: '5', name: 'Toasted Hazelnut Latte', category: 'Coffee', price: 220, isVeg: true, image: '/hazelnut_latte.jpg', desc: 'Single-origin Arabica espresso with warm roasted hazelnut notes.' },
  { id: '6', name: 'Chipotle Veggie Burger', category: 'Burgers', price: 220, isVeg: true, image: '/burger.jpg', desc: 'Crispy spiced vegetable patty, chipotle aioli, lettuce & tomato.' },
  { id: '7', name: 'Paneer Tikka Crostini', category: 'Starters', price: 240, isVeg: true, image: '/crostini.jpg', desc: 'Smokey tandoori marinated cottage cheese on crusty herb toasted baguette.' },
  { id: '8', name: 'Dark Chocolate Fudge Brownie', category: 'Dessert', price: 210, isVeg: true, image: '/brownie.jpg', desc: 'Warm gooey Belgian chocolate brownie with ganache drizzle.' },
  { id: '9', name: 'Iced Salted Caramel Frappé', category: 'Beverages', price: 250, isVeg: true, image: '/frappe.jpg', desc: 'Blended espresso, creamy milk, Himalayan salted caramel & whipped cream.' },
  { id: '10', name: 'Vanilla Bean Cheesecake', category: 'Dessert', price: 260, isVeg: true, image: '/cheesecake.png', desc: 'Silky smooth New York cheesecake with Madagascar vanilla beans.' },
  { id: '11', name: 'Table Hive Fiesta Combo', category: 'Combos', price: 499, isVeg: true, image: '/combo.jpg', desc: 'Signature pizza, peri-peri fries & two artisan coffee beverages.' }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  const [tableNumber, setTableNumber] = useState<number>(7);
  const [userName, setUserName] = useState<string>('Karan');
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  // Menu & Cart State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Audio Radio State
  const [currentStation, setCurrentStation] = useState<RadioStation>(CAFE_RADIO_STATIONS[0]);
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch real menu from server if available
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setIsPlayingRadio(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleToggleRadioPlay = () => {
    if (!audioRef.current) return;

    if (isPlayingRadio) {
      audioRef.current.pause();
      setIsPlayingRadio(false);
    } else {
      if (audioRef.current.src !== currentStation.streamUrl) {
        audioRef.current.src = currentStation.streamUrl;
      }
      audioRef.current
        .play()
        .then(() => setIsPlayingRadio(true))
        .catch(() => setIsPlayingRadio(false));
    }
  };

  const handleSelectRadioStation = (station: RadioStation) => {
    setCurrentStation(station);
    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current
        .play()
        .then(() => setIsPlayingRadio(true))
        .catch(() => setIsPlayingRadio(false));
    }
  };

  const handleToggleRadioMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isRadioMuted;
      setIsRadioMuted(!isRadioMuted);
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const itemId = item.id || item._id || item.name;
      const existing = prev.find((c) => (c.item.id || c.item._id || c.item.name) === itemId);
      if (existing) {
        return prev.map((c) =>
          (c.item.id || c.item._id || c.item.name) === itemId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { item, quantity: 1, selectedBy: userName }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => (c.item.id || c.item._id || c.item.name) === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((c) => (c.item.id || c.item._id || c.item.name) !== itemId);
      }
      return prev.map((c) =>
        (c.item.id || c.item._id || c.item.name) === itemId
          ? { ...c, quantity: c.quantity - 1 }
          : c
      );
    });
  };

  const clearCart = () => setCart([]);

  const handleAddSnackToCart = (snackName: string) => {
    const found = menuItems.find((m) => m.name.toLowerCase().includes(snackName.toLowerCase()));
    if (found) {
      addToCart(found);
      setActiveTab('cart');
    }
  };

  const handleAskAiAboutSong = (song: TrendingSong) => {
    setActiveTab('ai');
  };

  const totalCartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐝</span>
            <div>
              <h1 className="font-black text-sm tracking-tight text-slate-900 leading-none">
                TableHive
              </h1>
              <p className="text-[10px] text-brand-600 font-extrabold uppercase tracking-wider mt-0.5">
                Smart Café Companion
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTableModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-2xs hover:bg-brand-100 transition-colors cursor-pointer"
          >
            <span>Table #{tableNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Main Screens Content */}
      <main className="flex-1">
        {activeTab === 'menu' && (
          <MenuScreen
            menuItems={menuItems}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            tableNumber={tableNumber}
            userName={userName}
            onOpenTableModal={() => setIsTableModalOpen(true)}
            onGoToCart={() => setActiveTab('cart')}
          />
        )}

        {activeTab === 'cart' && (
          <CartScreen
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            tableNumber={tableNumber}
            userName={userName}
            onOrderPlaced={() => {}}
          />
        )}

        {activeTab === 'ai' && (
          <AiMitraScreen
            tableNumber={tableNumber}
            userName={userName}
          />
        )}

        {activeTab === 'music' && (
          <MusicRadioScreen
            currentStation={currentStation}
            isPlaying={isPlayingRadio}
            isMuted={isRadioMuted}
            onTogglePlay={handleToggleRadioPlay}
            onSelectStation={handleSelectRadioStation}
            onToggleMute={handleToggleRadioMute}
            onAskAiAboutSong={handleAskAiAboutSong}
          />
        )}

        {activeTab === 'cricket' && (
          <CricketScreen
            onAddSnackToCart={handleAddSnackToCart}
            tableNumber={tableNumber}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        isPlayingMusic={isPlayingRadio}
      />

      {/* Table & Diner Selector Modal */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={tableNumber}
        userName={userName}
        onSave={(newTable, newName) => {
          setTableNumber(newTable);
          setUserName(newName);
        }}
      />
    </div>
  );
};

export default App;
