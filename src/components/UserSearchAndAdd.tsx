import { useState } from 'react';
import {
  IonSearchbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
} from '@ionic/react';
import { person, trashBin } from 'ionicons/icons';
import firebase from 'firebase/app';
import 'firebase/firestore';

const UserSearchAndAdd = ({ onUserAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const firestore = firebase.firestore();

  const addUser = async (email) => {
    setIsAdding(true);
    const userSnapshot = await firestore
      .collection('publicUsers')
      .where('email', '==', email)
      .get();

    if (!userSnapshot.empty) {
      const user = userSnapshot.docs[0];

      // Get the group document from Firestore
      const groupSnapshot = await firestore
        .collection('groups')
        .doc('groupId')
        .get();
      const groupData = groupSnapshot.data();

      // Check if the user's ID is already in the members array
      if (groupData && groupData.members.includes(user.id)) {
        console.error(
          `User with email ${email} is already a member of the group.`
        );
      } else {
        // The user is not a member of the group, so add them
        onUserAdd(user.id, email);
      }
    }
    setIsAdding(false);
  };

  const searchUsers = async (term: string) => {
    let resultsData = [];

    if (term !== '') {
      const resultsSnapshot = await firestore
        .collection('publicUsers')
        .orderBy('email')
        .startAt(term)
        .endAt(term + '\uf8ff')
        .get();

      resultsData = resultsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    setSearchResults(resultsData);
  };

  return (
    <div>
      <IonSearchbar
        placeholder='Search for user by email'
        inputMode='email'
        // Uncomment the next line to show the Cancel button
        // showCancelButton='always'
        value={searchTerm}
        onIonInput={(e) => {
          const term = e.detail.value || '';
          setSearchTerm(term);
          if (term) {
            searchUsers(term);
          } else {
            setSearchResults([]);
          }
        }}
        onIonClear={() => setSearchResults([])}
      />

      <IonList>
        {searchResults.map((user, index) => (
          <IonItem key={index}>
            {/* <IonAvatar slot='start'> */}
            <IonIcon icon={person} className='icon-spacing-search'></IonIcon>
            {/* <img src={user.profilePicture || '/placeholder1.jpg'} /> */}
            {/* </IonAvatar> */}
            <IonLabel className='label-spacing'>{user.email}</IonLabel>
            <IonButton
              disabled={isAdding}
              onClick={() => {
                addUser(user.email);
              }}
            >
              Add
            </IonButton>
          </IonItem>
        ))}
      </IonList>
    </div>
  );
};

export default UserSearchAndAdd;
