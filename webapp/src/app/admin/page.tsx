'use client';

import React, { useEffect, useState } from 'react';
import { Shield, ExternalLink, ArrowRight } from 'lucide-react';

export default function AdminRedirectPage() {
  const [adminUrl, setAdminUrl] = useState('http://localhost:5175');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `http://${window.location.hostname}:5175`;
      setAdminUrl(url);
      // Auto-redirect to dedicated admin portal on port 5175
      window.location.href = url;
    }
  }, []);

  return (
    <div className="max-w-md mx-auto py-16 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-sm">
        <Shield className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-serif font-black text-roast-900">
          Redirecting to Admin Panel...
        </h1>
        <p className="text-xs text-muted max-w-sm">
          The Admin Portal is now running as a dedicated service on port <strong>5175</strong>.
        </p>
      </div>

      <a
        href={adminUrl}
        className="btn-primary px-6 py-3 text-sm font-bold shadow-gold flex items-center gap-2"
      >
        <span>Open Admin Panel (Port 5175)</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
