'use client';

import { useState } from 'react';
import { Star, Send, Trash2, AlertCircle } from 'lucide-react';

interface Review {
  id: string;
  assetId: string;
  assetType: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface ReviewSectionProps {
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  reviews: Review[];
  currentUserId?: string;
}

export default function ReviewSection({ assetId, assetType, reviews, currentUserId }: ReviewSectionProps) {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          assetType,
          rating: newRating,
          comment: newComment,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setLocalReviews([json.data, ...localReviews]);
        setNewRating(0);
        setNewComment('');
      } else {
        setError(json.error || 'Failed to submit review');
      }
    } catch {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setLocalReviews(localReviews.filter((r) => r.id !== reviewId));
      } else {
        setError(json.error || 'Failed to delete review');
      }
    } catch {
      setError('Failed to delete review');
    }
  };

  const averageRating = localReviews.length > 0
    ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length
    : 0;

  return (
    <div className="bg-white border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Reviews & Ratings</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {averageRating.toFixed(1)} ({localReviews.length})
          </span>
        </div>
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredStar || newRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience with this asset..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || newRating === 0}
          className="btn btn-primary"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      {localReviews.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Star className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No reviews yet</p>
          <p className="text-xs mt-1">Be the first to review this asset</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {review.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {review.user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="text-sm text-slate-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
