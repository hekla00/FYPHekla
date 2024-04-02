import firebase from 'firebase/app';
const db = firebase.firestore();
import { firestore } from '../firebase';
export const fetchBookBasedOnBookID = async (bookID) => {
  const bookSnapshot = await db.collection('books').doc(bookID).get();

  if (!bookSnapshot.exists) {
    console.log('No such book!');
    return null;
  }

  return { id: bookSnapshot.id, ...bookSnapshot.data() };
};

export const handleDelete = async (bookId, history) => {
  console.log('Deleting book with ID:', bookId);
  if (!bookId) {
    console.error('Book ID is not defined');
    return;
  }

  const currentUserId = firebase.auth().currentUser?.uid;
  // Query the userBooks collection for documents where bookId matches
  const userBooksQuery = firestore
    .collection('userBooks')
    .where('bookID', '==', bookId)
    .where('userID', '==', currentUserId);

  // Get the documents from the query
  const querySnapshot = await userBooksQuery.get();

  if (querySnapshot.empty) {
    console.error('Only the owner of the book can delete it');
    return;
  }

  // Delete each matching document from the userBooks collection
  querySnapshot.forEach((doc) => {
    try {
      doc.ref.delete();
      console.log('Book successfully deleted from userBooks collection');
    } catch (error) {
      console.error('Error deleting book from userBooks collection: ', error);
    }
  });
  // Reference to the book in the books collection
  // const bookRef = firestore.collection('books').doc(bookId);

  // // Delete the book from the books collection
  // try {
  //   await bookRef.delete();
  //   console.log('Book successfully deleted from books collection');
  // } catch (error) {
  //   console.error('Error deleting book from books collection: ', error);
  // }

  const booksReviewsQuery = firestore
    .collection('bookReviews')
    .where('bookID', '==', bookId);

  // Get the documents from the query
  const querySnapshotreview = await booksReviewsQuery.get();

  // Delete each matching document from the userBooks collection
  querySnapshotreview.forEach((doc) => {
    try {
      doc.ref.delete();
      console.log('Book successfully deleted from userBooks collection');
    } catch (error) {
      console.error('Error deleting book from userBooks collection: ', error);
    }
  });
  const booksNotesQuery = firestore
    .collection('bookNotes')
    .where('bookID', '==', bookId);

  // Get the documents from the query
  const querySnapshotNotes = await booksReviewsQuery.get();

  // Delete each matching document from the userBooks collection
  querySnapshotNotes.forEach((doc) => {
    try {
      doc.ref.delete();
      console.log('Book successfully deleted from userBooks collection');
    } catch (error) {
      console.error('Error deleting book from userBooks collection: ', error);
    }
  });
  history.goBack();
};
