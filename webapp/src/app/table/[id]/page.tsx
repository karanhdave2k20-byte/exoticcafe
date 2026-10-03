'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, AlertTriangle, CheckCircle, ArrowRight, Clock, Users } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import OnboardingStepper from '../../../components/OnboardingStepper';
import BackButton from '../../../components/BackButton';

function TableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const isInvite = searchParams.get('invite') === 'true';

  const tableId = (routeParams?.id as string) || '1';

  const { setTableInfo, user } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isOccupied, setIsOccupied] = useState(false);
  const [bookingConflictMessage, setBookingConflictMessage] = useState('');
  const [tableData, setTableData] = useState<{ id: number; status: string; seats: number } | null>(null);

  useEffect(() => {
    const checkTable = async () => {
      try {
        const res = await fetch(`/api/database/tables/${tableId}`);
        const data = await res.json();
        setTableData(data);

        // Check active reservations within the next 60 mins
        try {
          const syncRes = await fetch('/api/database/sync');
          const syncData = await syncRes.json();
          const tableBookings = syncData.bookings?.filter(
            (b: any) => parseInt(b.tableId) === parseInt(tableId)
          ) || [];

          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          for (const b of tableBookings) {
            if (!b.time) continue;
            if (b.date && b.date !== todayStr) continue;
            let finalHours = 0;
            let finalMinutes = 0;
            const timeStr = b.time.toLowerCase();

            if (timeStr.includes('am') || timeStr.includes('pm')) {
              const [time, modifier] = timeStr.split(' ');
              const [h, m] = time.split(':').map(Number);
              finalHours = (modifier === 'pm' && h < 12) ? h + 12 : (modifier === 'am' && h === 12) ? 0 : h;
              finalMinutes = m || 0;
            } else {
              const [h, m] = timeStr.split(':').map(Number);
              finalHours = h;
              finalMinutes = m || 0;
            }

            const bookingDate = new Date();
            bookingDate.setHours(finalHours, finalMinutes, 0, 0);
            const diffMins = Math.floor((bookingDate.getTime() - now.getTime()) / 60000);

            if (diffMins > 0 && diffMins <= 60) {
              setBookingConflictMessage(`Reserved! Guest arriving in ${diffMins} min (${b.time}).`);
              break;
            }
          }
        } catch (e) {}

        // Set table in context
        setTableInfo(prev => ({ ...prev, tableNo: tableId }));

        if (!isInvite && data && (data.status === 'Occupied' || data.status === 'Reserved')) {
          setIsOccupied(true);
        }
      } catch (err) {
        setTableInfo(prev => ({ ...prev, tableNo: tableId }));
      } finally {
        setIsLoading(false);
      }
    };

    checkTable();
  }, [tableId, setTableInfo, isInvite]);

  const handleProceed = () => {
    if (user?.isAuthenticated) {
      router.push('/people');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <BackButton href="/" label="Back to Scan" />
      </div>
      <OnboardingStepper currentStep={1} />

      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-warm-border bg-gradient-to-b from-[#FFFFFF] to-warm-subtle shadow-glass relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Table Plaque & Visual */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-caramel-500 to-caramel-500 p-0.5 shadow-gold flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                <Coffee className="w-10 h-10 text-caramel-600" />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700 block mb-1">
                Table QR Code Verified
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-roast-900 leading-tight">
                Welcome to Table Hive
              </h1>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-caramel-700 mt-1">
                You are joining Table {String(tableId).padStart(2, '0')}
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-2 max-w-md leading-relaxed">
                {isInvite 
                  ? 'You were invited by your table companion to join this shared dining session.'
                  : 'Your dedicated table session is activated. Order together, split the bill, and track your food.'}
              </p>
            </div>

            {/* Status Box */}
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-4 h-4 rounded-full border-2 border-caramel-500 border-t-transparent animate-spin" />
                <span>Verifying table seating status...</span>
              </div>
            ) : isOccupied || bookingConflictMessage ? (
              <div className="p-4 rounded-2xl bg-caramel-50 border border-caramel-200 text-caramel-900 text-xs flex items-center gap-3 text-left w-full shadow-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-caramel-600" />
                <div>
                  <p className="font-bold">Reservation Alert</p>
                  <p className="mt-0.5">{bookingConflictMessage || 'This table is marked active. If you are part of the table party, you may proceed.'}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 text-left w-full shadow-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold">Table #{tableId} is Sanitized & Ready</p>
                  <p className="mt-0.5">Seating capacity: {tableData?.seats || 4} guests. Welcome!</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Confirmation & Benefits */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 border border-warm-border flex flex-col gap-5 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-roast-900">
              Session Features for Table #{tableId}
            </h3>

            <div className="flex flex-col gap-3 text-xs text-muted">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-warm-subtle border border-warm-border/60">
                <Users className="w-5 h-5 text-caramel-600 flex-shrink-0" />
                <div>
                  <strong className="text-roast-900 block font-bold">1 Table = 1 Shared Cart</strong>
                  <span>Everyone sitting at this table can order together in real time.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-warm-subtle border border-warm-border/60">
                <Clock className="w-5 h-5 text-caramel-600 flex-shrink-0" />
                <div>
                  <strong className="text-roast-900 block font-bold">Live Kitchen Tracker</strong>
                  <span>Watch your food get accepted, prepared, and served.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleProceed}
                className="btn-primary w-full py-4 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group"
              >
                <span>Continue to Order</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/"
                className="btn-secondary w-full py-3 text-xs font-semibold text-muted hover:text-roast-900 text-center"
              >
                <span>Choose a Different Table</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TablePage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-16 text-center text-caramel-600">
        <div className="w-8 h-8 rounded-full border-2 border-caramel-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted">Checking table status...</p>
      </div>
    }>
      <TableContent />
    </Suspense>
  );
}
