import firebase from 'firebase/app';

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
