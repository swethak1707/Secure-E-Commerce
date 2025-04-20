import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from "../firebase.config";
import { useAuth } from '../context/AuthContext';

const ReviewList = ({ productId }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [helpfulReviews, setHelpfulReviews] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log("Fetching reviews for product:", productId);
        
        // Simple query without orderBy first - this can work without the composite index
        const reviewsRef = collection(db, 'reviews');
        const q = query(
          reviewsRef,
          where('productId', '==', productId)
        );
        
        console.log("Executing simple Firestore query...");
        const querySnapshot = await getDocs(q);
        console.log("Query completed, docs count:", querySnapshot.size);
        
        if (querySnapshot.empty) {
          console.log("No reviews found for this product");
          setReviews([]);
          setLoading(false);
          return;
        }
        
        // If we got here, we have reviews, so we can just sort them in memory
        // This avoids the need for the composite index
        const reviewsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Handle timestamps properly with fallback options
            createdAt: data.createdAt?.toDate ? 
                      data.createdAt.toDate() : 
                      data.createdAt ? new Date(data.createdAt) : new Date()
          };
        });
        
        // Sort the reviews by createdAt in memory instead of in the query
        reviewsData.sort((a, b) => b.createdAt - a.createdAt);
        
        console.log("Processed reviews:", reviewsData);
        setReviews(reviewsData);

        // Initialize helpfulReviews with any reviews the user has already marked
        if (currentUser) {
          const userHelpfulReviews = localStorage.getItem(`helpfulReviews_${currentUser.uid}`);
          if (userHelpfulReviews) {
            setHelpfulReviews(JSON.parse(userHelpfulReviews));
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          setError('This feature requires a database index. Please ask the administrator to set up the proper Firestore indexes.');
        } else {
          setError('Failed to load reviews. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    } else {
      console.error('No productId provided to ReviewList');
      setError('Unable to load reviews for this product.');
      setLoading(false);
    }
  }, [productId, currentUser]);

  const handleHelpfulClick = async (reviewId, isHelpful) => {
    if (!currentUser) {
      alert('Please log in to mark reviews as helpful.');
      return;
    }

    // Check if user has already marked this review
    const key = `${reviewId}`;
    if (helpfulReviews[key]) {
      alert('You have already rated this review.');
      return;
    }

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      
      // Update the helpful or not helpful count in Firestore
      await updateDoc(reviewRef, {
        [isHelpful ? 'helpful' : 'notHelpful']: increment(1)
      });

      // Update local state
      const updatedReviews = reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            [isHelpful ? 'helpful' : 'notHelpful']: (review[isHelpful ? 'helpful' : 'notHelpful'] || 0) + 1
          };
        }
        return review;
      });
      setReviews(updatedReviews);

      // Save user's choice to prevent multiple votes
      const updatedHelpfulReviews = {
        ...helpfulReviews,
        [key]: isHelpful ? 'helpful' : 'notHelpful'
      };
      setHelpfulReviews(updatedHelpfulReviews);
      
      if (currentUser) {
        localStorage.setItem(`helpfulReviews_${currentUser.uid}`, JSON.stringify(updatedHelpfulReviews));
      }
    } catch (err) {
      console.error('Error updating review helpfulness:', err);
      alert('Failed to update. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="ml-3 space-y-1">
                <div className="h-4 bg-gray-300 rounded w-36"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          ></path>
        </svg>
        <p className="mt-4 text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  // Function to format date
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{reviews.length} Review{reviews.length !== 1 && 's'}</h3>
      
      {reviews.map((review) => {
        const key = `${review.id}`;
        const userVote = helpfulReviews[key];
        
        return (
          <div key={review.id} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              {review.userPhoto ? (
                <img 
                  src={review.userPhoto} 
                  alt={review.userName} 
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-700 font-bold">
                    {review.userName?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* Verified badge if email exists */}
              {review.userEmail && (
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Verified Buyer
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{review.comment}</p>
            
            {/* Helpful buttons */}
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">Was this review helpful?</span>
              
              <button 
                className={`flex items-center mr-4 py-1 px-3 rounded ${
                  userVote === 'helpful' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleHelpfulClick(review.id, true)}
                disabled={userVote}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>
                Yes ({review.helpful || 0})
              </button>
              
              <button 
                className={`flex items-center py-1 px-3 rounded ${
                  userVote === 'notHelpful' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleHelpfulClick(review.id, false)}
                disabled={userVote}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2"></path>
                </svg>
                No ({review.notHelpful || 0})
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;