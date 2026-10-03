'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, RefreshCw, X, CheckCircle2, Coffee, 
  ArrowRight, Users, Scan, Sparkles, Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Modal from '../components/Modal';

export default function HomePage() {
  const router = useRouter();
  const { setTableInfo, adminTables } = useStore();

  const [mode, setMode] = useState<'view' | 'scan'>('view');
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedTable, setDetectedTable] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<'all' | '2' | '4' | 'large'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Direct table entrance handler
  const handleEnterTable = (tableNo: string | number) => {
    const cleanNo = String(tableNo).trim();
    if (!cleanNo) return;
    setTableInfo(prev => ({ ...prev, tableNo: cleanNo }));
    router.push(`/table/${cleanNo}`);
  };

  const handleScanSuccess = useCallback(() => {
    const tableId = 1;
    setDetectedTable(tableId);
    setIsScanning(false);
    setIsConfirmModalOpen(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'scan' && isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            handleScanSuccess();
            return 100;
          }
          return prev + 4;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [mode, isScanning, handleScanSuccess]);

  const startScanning = () => {
    setScanProgress(0);
    setIsScanning(true);
    setIsConfirmModalOpen(false);
    setMode('scan');
  };

  const finalizeScan = () => {
    if (detectedTable) {
      handleEnterTable(detectedTable);
    }
  };

  // Modern Lite Theme Camera Scanner
  if (mode === 'scan') {
    return (
      <div className="fixed inset-0 z-50 bg-crema-50/95 backdrop-blur-2xl flex flex-col justify-between p-6 text-roast-900 animate-fade-in">
        <div className="flex items-center justify-between z-10 pt-4 max-w-md mx-auto w-full">
          <button
            onClick={() => setMode('view')}
            className="p-3 rounded-full bg-white border border-warm-border hover:border-caramel-500 text-roast-900 shadow-sm transition-all"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-caramel-700">
              Table QR Camera
            </span>
            <span className="text-xs font-bold text-roast-900">
              Align Table QR Code
            </span>
          </div>
          <button
            onClick={startScanning}
            className="p-3 rounded-full bg-white border border-warm-border hover:border-caramel-500 text-roast-900 shadow-sm transition-all"
            title="Rescan"
          >
            <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin text-caramel-600' : ''}`} />
          </button>
        </div>

        {/* Viewfinder Target */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed border-caramel-500/40 rounded-3xl animate-pulse" />
          
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-caramel-600 rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-caramel-600 rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-caramel-600 rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-caramel-600 rounded-br-xl" />

          <div 
            className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-caramel-500 to-transparent shadow-[0_0_15px_#C88736] transition-all duration-75"
            style={{ top: `${scanProgress}%` }}
          />

          <div className="flex flex-col items-center gap-3">
            <QrCode className="w-20 h-20 text-caramel-700/60" />
            <span className="text-xs font-bold text-caramel-800 bg-white/80 px-3 py-1 rounded-full shadow-sm">
              Point camera at Table QR
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full flex flex-col items-center gap-3 pb-8">
          <button
            onClick={handleScanSuccess}
            className="w-full py-3.5 rounded-full bg-white border border-warm-border text-roast-900 font-bold text-xs shadow-sm hover:border-caramel-500 transition-all"
          >
            Simulate Instant QR Scan (Table #1)
          </button>
        </div>

        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Table QR Detected"
        >
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif text-roast-900">
                Welcome to Table #{detectedTable}
              </h3>
              <p className="text-xs text-muted mt-1">
                You scanned Table #{detectedTable}. Ready to join this table session?
              </p>
            </div>

            <div className="w-full flex gap-3 mt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="btn-secondary flex-1 py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={finalizeScan}
                className="btn-primary flex-1 py-3 text-xs font-bold shadow-gold"
              >
                Join Table #{detectedTable}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Fallback tables if admin tables empty
  const defaultTables = [
    { id: 1, seats: 4, status: 'Free', zone: 'Terrace Garden Booth' },
    { id: 2, seats: 2, status: 'Free', zone: 'Window Espresso Bar' },
    { id: 3, seats: 6, status: 'Free', zone: 'Artisan Family Table' },
    { id: 4, seats: 4, status: 'Free', zone: 'Courtyard Booth' },
    { id: 5, seats: 4, status: 'Free', zone: 'Roastery View Table' },
    { id: 6, seats: 2, status: 'Free', zone: 'Cozy Library Nook' },
    { id: 7, seats: 8, status: 'Free', zone: 'VIP Lounge Suite' },
    { id: 8, seats: 4, status: 'Free', zone: 'Garden Patio Table' },
  ];

  const sourceTables = adminTables.length > 0 ? adminTables : defaultTables;

  const displayTables = useMemo(() => {
    return sourceTables.map((t, idx) => {
      const fallback = defaultTables[idx % defaultTables.length];
      return {
        ...fallback,
        ...t,
        zone: t.zone || fallback.zone,
      };
    }).filter(t => {
      if (capacityFilter === '2') return t.seats <= 2;
      if (capacityFilter === '4') return t.seats === 3 || t.seats === 4;
      if (capacityFilter === 'large') return t.seats >= 5;
      return true;
    });
  }, [sourceTables, capacityFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto py-3 flex flex-col gap-6 animate-fade-in">
      {/* Artisanal Café Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-warm-border/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-caramel-50 border border-caramel-200/80 text-caramel-800 text-[11px] font-bold tracking-wider uppercase mb-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>Table Hive • Single Table Collaborative Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-roast-900 tracking-tight">
            Table QR System
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
            Every café table has its own unique QR code. Point your phone camera or select your table below to begin ordering together.
          </p>
        </div>

        {/* Action & Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Capacity Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-warm-border shadow-sm text-xs font-bold text-roast-900">
            <button
              onClick={() => setCapacityFilter('all')}
              className={`px-3 py-1.5 rounded-full transition-all ${capacityFilter === 'all' ? 'bg-caramel-500 text-white shadow-sm' : 'text-muted hover:text-roast-900'}`}
            >
              All (8)
            </button>
            <button
              onClick={() => setCapacityFilter('2')}
              className={`px-3 py-1.5 rounded-full transition-all ${capacityFilter === '2' ? 'bg-caramel-500 text-white shadow-sm' : 'text-muted hover:text-roast-900'}`}
            >
              2 Seats
            </button>
            <button
              onClick={() => setCapacityFilter('4')}
              className={`px-3 py-1.5 rounded-full transition-all ${capacityFilter === '4' ? 'bg-caramel-500 text-white shadow-sm' : 'text-muted hover:text-roast-900'}`}
            >
              4 Seats
            </button>
            <button
              onClick={() => setCapacityFilter('large')}
              className={`px-3 py-1.5 rounded-full transition-all ${capacityFilter === 'large' ? 'bg-caramel-500 text-white shadow-sm' : 'text-muted hover:text-roast-900'}`}
            >
              6-8 Seats
            </button>
          </div>

          <button
            onClick={startScanning}
            className="btn-secondary py-2.5 px-4 text-xs font-bold border-caramel-500/30 hover:border-caramel-500 flex items-center gap-2 shadow-sm rounded-full"
          >
            <Scan className="w-4 h-4 text-caramel-600" />
            <span>Camera Scanner</span>
          </button>
        </div>
      </div>

      {/* Grid: Unique Artisanal Table Plaque Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayTables.map(t => {
          const tableNumStr = String(t.id).padStart(2, '0');
          const tableTargetUrl = `${baseUrl || 'http://localhost:5174'}/table/${t.id}`;
          // Generate high quality QR code URL with margin
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(tableTargetUrl)}`;

          return (
            <div
              key={t.id}
              className="table-plaque p-3 flex flex-col items-center gap-2.5 text-center group"
            >
              {/* Plaque Header */}
              <div className="flex items-center justify-between w-full border-b border-warm-border/70 pb-2">
                <div className="flex items-center gap-1.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-caramel-600 to-caramel-400 p-[1px] shadow-sm flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
                      <span className="font-sans font-bold text-caramel-700 text-[10px]">
                        №{tableNumStr}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-sans font-bold text-roast-900 leading-tight">
                      Table {tableNumStr}
                    </h2>
                    <span className="text-[9px] text-muted font-medium block truncate max-w-[80px]">
                      {t.zone}
                    </span>
                  </div>
                </div>

                {/* Capacity & Live Status Indicator */}
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-caramel-800 bg-caramel-50 border border-caramel-200/60 px-1.5 py-0.5 rounded-full">
                    <Users className="w-2.5 h-2.5 text-caramel-600" />
                    <span>{t.seats || 4}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ready</span>
                  </div>
                </div>
              </div>

              {/* Styled Table QR Stand Frame */}
              <div className="relative p-2 bg-white rounded-xl border border-warm-border shadow-inner group-hover:border-caramel-500 transition-all duration-300">
                {/* Brackets */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-caramel-500/80 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-caramel-500/80 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-caramel-500/80 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-caramel-500/80 rounded-br-sm pointer-events-none" />

                <img
                  src={qrImageUrl}
                  alt={`QR Code for Table ${tableNumStr}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md"
                  loading="lazy"
                />

                {/* Center Emblem */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 rounded-lg bg-white border border-caramel-300 shadow-md flex items-center justify-center">
                    <Coffee className="w-3 h-3 text-caramel-600" />
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="w-full flex flex-col gap-2 pt-1">
                <Link
                  href={`/table/${t.id}`}
                  onClick={() => handleEnterTable(t.id)}
                  className="btn-primary w-full py-2 text-[11px] font-bold flex items-center justify-center gap-1 shadow-gold group-hover:scale-[1.02] transition-all duration-200 rounded-lg"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
