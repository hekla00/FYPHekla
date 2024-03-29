import firebase from 'firebase/app';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByAuthor,
  fetchThumbnailByTitle,
} from './APIHelper';
import { fetchBookBasedOnBookID } from './BooksHelper';
const db = firebase.firestore();
const currentUserId = firebase.auth().currentUser?.uid;

export const fetchMembersData = async (selectedGroup, setMembersData) => {
  if (!selectedGroup) {
    setMembersData([]);
    return;
  }
  // Fetch user data for each member
  const membersDataPromises = selectedGroup.members.map((memberId) =>
    db.collection('publicUsers').doc(memberId).get()
  );
  const membersSnapshots = await Promise.all(membersDataPromises);

  // Map over the snapshots to get the user data
  const membersData = membersSnapshots.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  }));
  //   console.log('membersData:', membersData);
  setMembersData(membersData);
};

export const fetchGroup = async (groupId, setGroup, setLoading) => {
  const doc = await db.collection('groups').doc(groupId).get();
  //   console.log('doc.data():', doc.data());
  if (doc.exists) {
    setGroup({ id: doc.id, ...doc.data() });
    // console.log('group:', group);
  } else {
    console.error('No such group!');
  }
  setLoading(false);
  //   console.log('loading:', loading);
};

export const fetchGroupTwo = async (groupId) => {
  const doc = await db.collection('groups').doc(groupId).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  } else {
    console.error('No such group!');
    return null;
  }
};

export const fetchGroupCurrentUser = async (setGroups, setLoading) => {
  const db = firebase.firestore();
  // console.log('currentUserId', currentUserId);
  db.collection('groups')
    .where('members', 'array-contains', currentUserId)
    .get()
    .then((snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // console.log('groups', groups);
      setGroups(groups);
      // console.log('groups after', groups);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching groups:', error);
    });
};
export const getUsersBooks = async (memberId) => {
  const userBooks = await db
    .collection('userBooks')
    .where('userID', '==', memberId)
    .limit(3)
    .get();
  return userBooks;
};
export const fetchReviewsForGroupMembers = async (
  membersData,
  setThumbnails,
  setReviewsData,
  setLoading
) => {
  // if (selectedGroup) {
  const reviewsDataPromises = membersData.map(async (member) => {
    const userBooksSnapshot = await getUsersBooks(member.id);
    const userID = member.id;

    const userSnapshot = await db.collection('publicUsers').doc(userID).get();
    const userData = userSnapshot.data();

    const reviewIDs = userBooksSnapshot.docs.map((doc) => doc.data().bookID);
    let reviewsData = [];
    if (reviewIDs.length > 0) {
      const reviewsSnapshot = await db
        .collection('bookReviews')
        .where('bookID', 'in', reviewIDs)
        .get();
      reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    const userBooksData = await Promise.all(
      userBooksSnapshot.docs.map(async (doc) => {
        const userBookData = doc.data();
        const review = reviewsData.find(
          (review: { id: string; bookID: string }) =>
            review.bookID === userBookData.bookID
        );
        const book = (await fetchBookBasedOnBookID(userBookData.bookID)) as {
          isbn?: string;
          title?: string;
        };
        // console.log('book', book);
        let thumbnail;
        try {
          thumbnail = await fetchThumbnailByISBN(book?.isbn);
        } catch (error) {
          thumbnail = await fetchThumbnailByTitle(book?.title);
        }
        return {
          ...userBookData,
          review,
          user: userData,
          book,
          thumbnail,
        };
      })
    );

    // console.log('userBooksData', userBooksData);
    return userBooksData;
  });

  const resolvedReviewsData = await Promise.all(reviewsDataPromises);
  const newThumbnails = {};
  const fetchedTitles = new Set();
  let thumbnailCount = 0;

  for (const userBooksData of resolvedReviewsData) {
    for (const userBookData of userBooksData) {
      if (thumbnailCount >= 5) {
        break;
      }

      if (!fetchedTitles.has(userBookData.book.title)) {
        newThumbnails[userBookData.book.title] = userBookData.thumbnail;
        fetchedTitles.add(userBookData.book.title);
        thumbnailCount++;
      }
    }

    if (thumbnailCount >= 5) {
      break;
    }
  }
  //   console.log('newThumbnails', newThumbnails);
  setThumbnails(newThumbnails);
  setReviewsData(resolvedReviewsData);
  setLoading(false);
};
