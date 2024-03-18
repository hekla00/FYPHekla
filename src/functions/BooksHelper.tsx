import firebase from 'firebase/app';
const db = firebase.firestore();

export const fetchBookBasedOnBookID = async (bookID) => {
  const bookSnapshot = await db.collection('books').doc(bookID).get();

  if (!bookSnapshot.exists) {
    console.log('No such book!');
    return null;
  }

  return { id: bookSnapshot.id, ...bookSnapshot.data() };
};
