import { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import firebase from 'firebase/app';
import AddMemberForm from '../components/AddMemberForm';

const AddMemberPage = () => {
  const firestore = firebase.firestore();
  const [groupId, setGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupId = async () => {
      const userUid = firebase.auth().currentUser.uid;

      // Query the 'groups' collection where the 'members' array contains the current user's ID
      const groupSnapshot = await firestore
        .collection('groups')
        .where('members', 'array-contains', userUid)
        .get();

      if (!groupSnapshot.empty) {
        // If the user is part of multiple groups, this will get the ID of the first group in the query results
        const groupId = groupSnapshot.docs[0].id;
        setGroupId(groupId);
        setLoading(false);
      }
    };

    fetchGroupId();
  }, [firestore]);

  if (loading) {
    return <div>Loading...</div>; // Or your preferred loading UI
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/groups' />
          </IonButtons>
          <IonTitle>Add a Member</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Pass the groupId to the AddMemberForm */}
        <AddMemberForm groupId={groupId} firestore={firestore} />
      </IonContent>
    </IonPage>
  );
};

export default AddMemberPage;
