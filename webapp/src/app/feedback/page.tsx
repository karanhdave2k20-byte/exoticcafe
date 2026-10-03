'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, ThumbsUp, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

export default function FeedbackPage() {
  const router = useRouter();
  const { user, tableInfo, showToast } = useStore();

  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackPayload = {
      user: user?.n || user?.name || 'Table Guest',
      rating: Math.round((foodRating + serviceRating + ambianceRating) / 3),
      comments: comments.trim() || 'Exceptional experience!',
      tableNo: tableInfo?.tableNo || 'Takeaway',
      date: new Date().toISOString(),
    };

    try {
      await fetch('/api/database/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload),
      });

      showToast('Thank you for your valuable feedback! ❤️', 'success');
      router.push('/thanks');
    } catch (err) {
      showToast('Error recording review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRow = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-crema-200 last:border-b-0">
      <span className="text-xs font-semibold text-roast-900">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-125 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-caramel-500 fill-caramel-500' : 'text-crema-300 stroke-crema-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-start">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-caramel-500/20 shadow-glass flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-caramel-50 text-caramel-600 border border-caramel-200 text-xs font-bold tracking-widest uppercase mb-2">
            <Heart className="w-3.5 h-3.5 fill-caramel-500" />
            <span>Customer Review</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-roast-900">
            Rate Your Dining Experience
          </h1>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Your feedback directly empowers our baristas and kitchen team to craft world-class hospitality.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 glass-card p-4 rounded-2xl border border-crema-300 bg-crema-50/50">
            <StarRow
              label="Culinary & Coffee Craft"
              value={foodRating}
              onChange={setFoodRating}
            />
            <StarRow
              label="Table Hospitality & Speed"
              value={serviceRating}
              onChange={setServiceRating}
            />
            <StarRow
              label="Café Ambiance & Acoustics"
              value={ambianceRating}
              onChange={setAmbianceRating}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-caramel-700 block mb-2">
              Share Your Thoughts
            </label>
            <textarea
              rows={3}
              placeholder="What made your visit delightful? Any dish you adored?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full glass-input p-3.5 rounded-2xl text-xs leading-relaxed"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/menu')}
              className="btn-secondary flex-1 py-3 text-xs"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 py-3 text-sm font-bold shadow-gold group"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
