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
  const { setTableInfo, adminTables, serverIp } = useStore();

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

  // Vibrant Theme Camera Scanner Modal
  if (mode === 'scan') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-2xl flex flex-col justify-between p-6 text-white animate-fade-in">
        <div className="flex items-center justify-between z-10 pt-4 max-w-md mx-auto w-full">
          <button
            onClick={() => setMode('view')}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-sm transition-all"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-purple-400">
              Table QR Camera
            </span>
            <span className="text-xs font-bold text-slate-200">
              Align Table QR Code
            </span>
          </div>
          <button
            onClick={startScanning}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-sm transition-all"
            title="Rescan"
          >
            <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>

        {/* Viewfinder Target */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed border-purple-500/40 rounded-3xl animate-pulse" />
          
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]" />

          <div 
            className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_#A855F7] transition-all duration-75"
            style={{ top: `${scanProgress}%` }}
          />

          <div className="flex flex-col items-center gap-3">
            <QrCode className="w-20 h-20 text-purple-400/60" />
            <span className="text-xs font-bold text-slate-900 bg-white/90 px-3 py-1 rounded-full shadow-lg">
              Point camera at Table QR
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full flex flex-col items-center gap-3 pb-8">
          <button
            onClick={handleScanSuccess}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg transition-all"
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
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

  return (
    <div className="w-full max-w-[1920px] mx-auto py-2 sm:py-3 flex flex-col gap-6 animate-fade-in pb-16 px-1 sm:px-2">
      {/* 🌟 Header Bar with Colorful Theme */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-5 border-b border-purple-100/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-900 text-[11px] font-bold tracking-wider uppercase mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>TableHive • Single Table Collaborative Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-roast-900 tracking-tight">
            Table QR System
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
            Every café table has its own unique QR code. Point your phone camera or select your table below to begin ordering together.
          </p>
        </div>

        {/* Action & Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Capacity Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-purple-200/80 shadow-xs text-xs font-bold text-roast-900">
            <button
              onClick={() => setCapacityFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                capacityFilter === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' 
                  : 'text-muted hover:text-roast-900'
              }`}
            >
              All ({sourceTables.length})
            </button>
            <button
              onClick={() => setCapacityFilter('2')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                capacityFilter === '2' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' 
                  : 'text-muted hover:text-roast-900'
              }`}
            >
              2 Seats
            </button>
            <button
              onClick={() => setCapacityFilter('4')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                capacityFilter === '4' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' 
                  : 'text-muted hover:text-roast-900'
              }`}
            >
              4 Seats
            </button>
            <button
              onClick={() => setCapacityFilter('large')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                capacityFilter === 'large' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' 
                  : 'text-muted hover:text-roast-900'
              }`}
            >
              6-8 Seats
            </button>
          </div>

          <button
            onClick={startScanning}
            className="btn-secondary py-2 px-4 text-xs font-bold border-purple-300 hover:border-purple-500 text-purple-900 flex items-center gap-2 shadow-xs rounded-full bg-white hover:bg-purple-50 transition-all"
          >
            <Scan className="w-4 h-4 text-purple-600" />
            <span>Camera Scanner</span>
          </button>
        </div>
      </div>

      {/* 🏷️ Full-Screen Grid: Colorful Table Plaque Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 w-full">
        {displayTables.map(t => {
          const tableNumStr = String(t.id).padStart(2, '0');
          const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
          const tableTargetUrl = `http://${serverIp === 'localhost' ? hostname : serverIp}:5174/table/${t.id}`;
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&ecc=H&data=${encodeURIComponent(tableTargetUrl)}`;
          const isOccupied = t.status === 'Occupied';

          return (
            <div
              key={t.id}
              className="table-plaque p-3 flex flex-col items-center justify-between gap-2.5 text-center group bg-white/95 hover:bg-white rounded-2xl border border-purple-200/80 hover:border-purple-500 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full"
            >
              {/* Plaque Header */}
              <div className="flex items-center justify-between w-full border-b border-purple-100/80 pb-2">
                <div className="flex items-center gap-1.5 text-left">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 p-[1.5px] shadow-xs flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
                      <span className="font-sans font-black text-purple-700 text-[10px] sm:text-[11px]">
                        №{tableNumStr}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-sans font-bold text-roast-900 leading-tight">
                      Table {tableNumStr}
                    </h2>
                    <span className="text-[9px] text-muted font-medium block truncate max-w-[80px]">
                      {t.zone}
                    </span>
                  </div>
                </div>

                {/* Capacity & Live Status Indicator */}
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-purple-800 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded-full">
                    <Users className="w-2.5 h-2.5 text-purple-600" />
                    <span>{t.seats || 4}</span>
                  </div>
                  {isOccupied ? (
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Occupied</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Styled Table QR Stand Frame */}
              <div className="relative p-2 bg-white rounded-xl border border-purple-200/80 shadow-inner group-hover:border-purple-500 transition-all duration-300 w-full flex items-center justify-center">
                {/* Purple Brackets */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-purple-500 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-purple-500 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-purple-500 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-purple-500 rounded-br-sm pointer-events-none" />

                <img
                  src={qrImageUrl}
                  alt={`QR Code for Table ${tableNumStr}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Action Area with Purple Gradient Button */}
              <div className="w-full flex flex-col gap-2 pt-1">
                <Link
                  href={`/table/${t.id}`}
                  onClick={() => handleEnterTable(t.id)}
                  className={`w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md group-hover:scale-[1.02] transition-all duration-200 rounded-xl ${
                    isOccupied
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25'
                  }`}
                >
                  <span>{isOccupied ? 'Occupied (Join)' : 'Open'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
