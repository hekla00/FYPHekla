import firebase from 'firebase/app';

const db = firebase.firestore();

export const updateReview = async (rating, review, userID, bookID) => {
  if (!rating || !review) {
    alert('Please enter a rating and review.');
    return;
  }

  const docId = `${userID}_${bookID}`;

  const reviewDocRef = db.collection('bookReviews').doc(docId);
  const reviewDoc = await reviewDocRef.get();

  if (reviewDoc.exists) {
    await reviewDocRef.update({
      rating,
      review,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await reviewDocRef.set({
      rating,
      review,
      userID,
      bookID: bookID,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const updateNotes = async (notes, userID, bookID) => {
  if (!notes) {
    alert('Please enter a note.');
    return;
  }

  const docId = `${userID}_${bookID}`;

  const reviewDocRef = db.collection('bookNotes').doc(docId);
  const reviewDoc = await reviewDocRef.get();

  if (reviewDoc.exists) {
    await reviewDocRef.update({
      notes,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await reviewDocRef.set({
      notes,
      userID,
      bookID: bookID,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const fetchReview = async (userID, bookID, setRating, setReview) => {
  const docId = `${userID}_${bookID}`;

  const reviewDocRef = db.collection('bookReviews').doc(docId);
  const reviewDoc = await reviewDocRef.get();

  if (reviewDoc.exists) {
    const data = reviewDoc.data();
    setRating(data.rating);
    setReview(data.review);
  }
};
export const fetchReviewSimple = async (userID, bookID) => {
  const docId = `${userID}_${bookID}`;

  const reviewDocRef = db
    .collection('bookReviews')
    .orderBy('timestamp', 'desc')
    .limit(5);
  const reviewDoc = await reviewDocRef.get();

  if (!reviewDoc.empty) {
    const data = reviewDoc.docs[0].data();
    //   setRating(data.rating);
    //   setReview(data.review);
    return data;
  }
  return null;
};

export const fetchNotes = async (userID, bookID, setNotes) => {
  const docId = `${userID}_${bookID}`;

  const reviewDocRef = db.collection('bookNotes').doc(docId);
  const reviewDoc = await reviewDocRef.get();

  if (reviewDoc.exists) {
    const data = reviewDoc.data();
    setNotes(data.notes);
  }
};
