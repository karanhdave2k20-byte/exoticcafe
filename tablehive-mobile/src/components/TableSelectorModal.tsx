import React, { useState } from 'react';
import { X, Users, Check, Sparkles } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: number;
  userName: string;
  onSave: (table: number, name: string) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  userName,
  onSave,
}) => {
  const [selectedTable, setSelectedTable] = useState(currentTable);
  const [name, setName] = useState(userName);

  if (!isOpen) return null;

  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleConfirm = () => {
    onSave(selectedTable, name.trim() || 'Guest');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold">
              🐝
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">TableHive Seating</h3>
              <p className="text-xs text-slate-500">Select your café table & diner name</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diner Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-600" />
            Your Name / Nickname
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Karan"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-brand-600 text-sm font-semibold text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Table Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Select Table Number</span>
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              Table #{selectedTable} Selected
            </span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {tables.map((t) => {
              const isSel = selectedTable === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md scale-105'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  <span className="text-xs">{t === 7 ? '🌟' : '🪑'}</span>
                  <span className="mt-0.5">#{t}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Confirm & Enter Table #{selectedTable}</span>
        </button>
      </div>
    </div>
  );
};
