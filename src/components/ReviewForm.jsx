import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from "../firebase.config"
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ productId }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to leave a review');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Add the review to the 'reviews' collection
      // Match the exact structure seen in your Firestore
      const reviewData = {
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userEmail: currentUser.email,
        userPhoto: currentUser.photoURL || '',
        rating,
        comment,
        createdAt: serverTimestamp(),
        helpful: 0,
        notHelpful: 0
      };

      const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log("Review added with ID: ", reviewRef.id);

      // Update the product's review count
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          reviewCount: increment(1)
        });
      } catch (productError) {
        console.error('Error updating product review count:', productError);
        // Continue since the review was still successfully added
      }

      setSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      
      // Reload the page after a brief delay to show the new review
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <p className="text-center text-gray-700">
          Please <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium">log in</a> to leave a review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 p-4 rounded-md text-green-800">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => setRating(star)}
              >
                <svg 
                  className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300 transition-colors`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{rating} out of 5 stars</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-6 rounded-md font-medium text-white ${
              isSubmitting
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors duration-200`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;