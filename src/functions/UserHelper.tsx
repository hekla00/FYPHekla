import firebase from 'firebase/app';
const currentUserId = firebase.auth().currentUser?.uid;
const db = firebase.firestore();
// const currentUserId = firebase.auth().currentUser?.uid;

// Fetching the number of books the user has
export const fetchNumBooks = async (setNumBooks) => {
  const userId = firebase.auth().currentUser?.uid;
  const snapshot = await firebase
    .firestore()
    .collection('userBooks')
    .where('userID', '==', userId)
    .get();
  setNumBooks(snapshot.size);
};

export const fetchNumGroups = async (setNumGroups) => {
  const userId = firebase.auth().currentUser?.uid;
  const snapshot = await firebase
    .firestore()
    .collection('groups')
    .where('members', 'array-contains', userId)
    .get();
  setNumGroups(snapshot.size);
};

export const fetchNumLoans = async (setNumLoans) => {
  const userId = firebase.auth().currentUser?.uid;
  const snapshot = await firebase
    .firestore()
    .collection('bookLoans')
    .where('userID', '==', userId)
    .get();
  setNumLoans(snapshot.size);
};

export const fetchAllUserBooks = async (setIsLoading, setAllBooks) => {
  setIsLoading(true);
  try {
    const db = firebase.firestore();
    const userId = firebase.auth().currentUser?.uid;
    console.log('userId lib', userId);
    if (!userId) {
      console.error('No user is currently logged in.');
      return;
    }

    // Fetch userBooks documents for the current user
    const userBooksSnapshot = await db
      .collection('userBooks')
      .where('userID', '==', userId)
      .get();

    // Extract book IDs from the userBooks documents
    const bookIds = userBooksSnapshot.docs.map((doc) => doc.data().bookID);
    console.log('bookIds:', bookIds);

    // Fetch books documents for the extracted book IDs
    const booksPromises = bookIds.map((ID) =>
      db.collection('books').doc(ID).get()
    );
    const booksSnapshots = await Promise.all(booksPromises);

    // Extract book data from the books documents
    // Important to define the id of the book otherwise it will be undefined and the book will not be displayed
    const allBooks = booksSnapshots.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
    console.log('allBooks:', allBooks);

    setAllBooks(allBooks as any[]);
  } catch (error) {
    console.error('Error fetching all books:', error);
  } finally {
    setIsLoading(false);
  }
};

export const fetchGroupCurrentUser = async () => {
  const db = firebase.firestore();
  const currentUserId = firebase.auth().currentUser?.uid;
  try {
    const snapshot = await db
      .collection('groups')
      .where('members', 'array-contains', currentUserId)
      .get();

    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const fetchAllUserAndGroupBooks = async (
  setIsLoading,
  setAllBooks
  // setFilteredBooks
) => {
  setIsLoading(true);
  try {
    const db = firebase.firestore();
    const userId = firebase.auth().currentUser?.uid;
    console.log('userId lib', userId);
    if (!userId) {
      console.error('No user is currently logged in.');
      return;
    }

    // Fetch groups for the current user
    const groups = await fetchGroupCurrentUser();

    // Extract user IDs from the group data
    type Group = {
      id: string;
      members: string[];
    };

    const groupUserIds = groups.flatMap((group: Group) => group.members);

    // Fetch userBooks documents for the users in the same groups
    const groupBooksPromises = groupUserIds.map((id) =>
      db.collection('userBooks').where('userID', '==', id).get()
    );
    const groupBooksSnapshots = await Promise.all(groupBooksPromises);

    // Combine the userBooks documents of the current user and the users in the same groups
    const allUserBooksSnapshots = [
      // ...userBooksSnapshot.docs,
      ...groupBooksSnapshots.flatMap((snapshot) => snapshot.docs),
    ];

    // Extract book IDs from the userBooks documents
    const bookIds = allUserBooksSnapshots.map((doc) => doc.data().bookID);
    console.log('bookIds:', bookIds);
    const uniqueBookIds = Array.from(new Set(bookIds));
    console.log('uniqueBookIds:', uniqueBookIds);
    // Fetch books documents for the extracted book IDs
    const booksPromises = uniqueBookIds.map((ID) =>
      db.collection('books').doc(ID).get()
    );
    const booksSnapshots = await Promise.all(booksPromises);

    // Extract book data from the books documents
    const allBooks = booksSnapshots.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
    console.log('allBooks:', allBooks);

    setAllBooks(allBooks as any[]);
  } catch (error) {
    console.error('Error fetching all books:', error);
  } finally {
    setIsLoading(false);
  }
};
export const fetchNumBooksInWishlist = async (setNumBooksInWishlist) => {
  const currentUserId = firebase.auth().currentUser?.uid;
  if (currentUserId) {
    const wishlistSnapshot = await db
      .collection('wishlist')
      .where('userId', '==', currentUserId)
      .get();

    setNumBooksInWishlist(wishlistSnapshot.size);
  } else {
    console.error('currentUserId is undefined');
  }
};

export const fetchSelectedGroupBooks = async (
  setIsLoading,
  setAllBooks,
  groupId
) => {
  try {
    const db = firebase.firestore();

    // Fetch the group document for the selected group
    const groupSnapshot = await db.collection('groups').doc(groupId).get();
    const group = groupSnapshot.data();

    // Extract user IDs from the group data
    const groupUserIds = group.members;

    // Fetch userBooks documents for the users in the group
    const groupBooksPromises = groupUserIds.map((id) =>
      db.collection('userBooks').where('userID', '==', id).get()
    );
    const groupBooksSnapshots = await Promise.all(groupBooksPromises);

    // Combine the userBooks documents of the users in the group
    const allUserBooksSnapshots = groupBooksSnapshots.flatMap(
      (snapshot) => snapshot.docs
    );

    // Extract book IDs from the userBooks documents
    const bookIds = allUserBooksSnapshots.map((doc) => doc.data().bookID);
    const uniqueBookIds = Array.from(new Set(bookIds));

    // Fetch books documents for the extracted book IDs
    const booksPromises = uniqueBookIds.map((ID) =>
      db.collection('books').doc(ID).get()
    );
    const booksSnapshots = await Promise.all(booksPromises);

    // Extract book data from the books documents
    const groupBooks = booksSnapshots.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));

    setAllBooks(groupBooks);
  } catch (error) {
    console.error('Error fetching group books:', error);
  } finally {
    setIsLoading(false);
  }
};

export const fetchUserSpecificInfo = async (bookID, userID) => {
  if (!bookID || !userID) {
    throw new Error('bookID and userID must be defined');
  }
  const userBookSnapshot = await db
    .collection('userBooks')
    .where('userID', '==', userID)
    .where('bookID', '==', bookID)
    .get();
  // return userBookSnapshot.docs[0].data();
  const doc = userBookSnapshot.docs.find((doc) => doc.exists);
  return doc ? doc.data() : undefined;
  // return userBookSnapshot.docs.map((doc) => doc.data());
};

export const fetchLoanDetails = async (bookID, userID) => {
  if (!bookID || !userID) {
    throw new Error('bookID and userID must be defined');
  }
  const loanSnapshot = await db
    .collection('bookLoans')
    .where('userID', '==', userID)
    .where('bookID', '==', bookID)
    .get();
  return loanSnapshot.docs.map((doc) => doc.data());
};

export const returnBook = async (bookID, userID, onReturn) => {
  console.log('Returning book:', bookID, 'for user:', userID);
  const loanSnapshot = await db
    .collection('bookLoans')
    .where('userID', '==', userID)
    .where('bookID', '==', bookID)
    .get();

  if (!loanSnapshot.empty) {
    const loanDoc = loanSnapshot.docs[0];
    await db.collection('bookLoans').doc(loanDoc.id).update({
      loaned: false,
      endDate: firebase.firestore.Timestamp.now(),
    });
    onReturn();
  }
};

export const fetchAllUserBooksLoans = async (setIsLoading, setAllBooks) => {
  setIsLoading(true);
  try {
    const db = firebase.firestore();
    const userId = firebase.auth().currentUser?.uid;
    console.log('userId lib', userId);
    if (!userId) {
      console.error('No user is currently logged in.');
      return;
    }

    // Fetch bookLoans documents for the current user
    const loanSnapshot = await db
      .collection('bookLoans')
      .where('userID', '==', userId)
      .get();

    // Extract book IDs from the bookLoans documents
    const bookIds = loanSnapshot.docs.map((doc) => doc.data().bookID);
    console.log('bookIds:', bookIds);

    // Fetch books documents for the extracted book IDs
    const booksPromises = bookIds.map((ID) =>
      db.collection('books').doc(ID).get()
    );
    const booksSnapshots = await Promise.all(booksPromises);

    // Extract book data from the books documents
    // Important to define the id of the book otherwise it will be undefined and the book will not be displayed
    const allBooks = booksSnapshots.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
    console.log('allBooks:', allBooks);

    setAllBooks(allBooks as any[]);
  } catch (error) {
    console.error('Error fetching all books:', error);
  } finally {
    setIsLoading(false);
  }
};
