import firebase from 'firebase/app';
const db = firebase.firestore();
const currentUserId = firebase.auth().currentUser?.uid;

export const fetchMembersData = async (group, setMembersData) => {
  // Fetch user data for each member
  const membersDataPromises = group.members.map((memberId) =>
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
