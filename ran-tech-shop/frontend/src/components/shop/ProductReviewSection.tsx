import { useState } from 'react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface ProductReviewSectionProps {
  reviews?: Review[];
}

export default function ProductReviewSection({ reviews: initialReviews = [] }: ProductReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    text: '',
  });

  const handleAddReview = () => {
    if (newReview.name.trim() && newReview.text.trim()) {
      const review: Review = {
        id: Date.now().toString(),
        name: newReview.name,
        rating: newReview.rating,
        text: newReview.text,
        date: new Date().toLocaleDateString(),
      };
      setReviews([review, ...reviews]);
      setNewReview({ name: '', rating: 5, text: '' });
      setShowReviewForm(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="py-16 border-t border-white/10">
      <div className="space-y-12">
        {/* Reviews Summary */}
        <div className="flex items-start justify-between md:items-center md:flex-row flex-col gap-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">Customer Reviews</h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(Math.round(Number(averageRating)))].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              <span className="text-white/60">{averageRating} out of 5 ({reviews.length} reviews)</span>
            </div>
          </div>
          {!showReviewForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-dark font-semibold rounded-lg whitespace-nowrap"
            >
              Write a Review
            </motion.button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <h4 className="text-xl font-bold text-white">Share Your Experience</h4>
            
            <input
              type="text"
              placeholder="Your Name"
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F7B500]"
            />

            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F7B500]"
            >
              <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
              <option value="4">⭐⭐⭐⭐ - Good</option>
              <option value="3">⭐⭐⭐ - Average</option>
              <option value="2">⭐⭐ - Poor</option>
              <option value="1">⭐ - Very Poor</option>
            </select>

            <textarea
              placeholder="Share your experience with this product..."
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F7B500] resize-none"
            />

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddReview}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-dark font-semibold rounded-lg"
              >
                Post Review
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewForm(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white font-semibold rounded-lg hover:border-[#F7B500]/60"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Reviews List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{review.name}</div>
                    <div className="text-sm text-white/50">{review.date}</div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-sm">{review.text}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
