const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Send welcome email to new users
exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  // Implementation for sending welcome email
  console.log('New user created:', user.email);
  return null;
});

// Update tutor rating when new review is added
exports.updateTutorRating = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const tutorId = review.tutorId;
    
    // Calculate new average rating
    const reviewsRef = admin.firestore().collection('reviews');
    const tutorRef = admin.firestore().collection('tutors').doc(tutorId);
    
    const reviewsSnapshot = await reviewsRef
      .where('tutorId', '==', tutorId)
      .get();
    
    let totalRating = 0;
    let count = 0;
    
    reviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
      count++;
    });
    
    const newAverage = totalRating / count;
    
    await tutorRef.update({
      rating: newAverage,
      totalReviews: count
    });
    
    return null;
  });