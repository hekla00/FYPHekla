import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import GroupCreationForm from '../components/GroupCreationForm';
import firebase from 'firebase/app';
import AddMemberForm from '../components/AddMemberForm';

const GroupCreationPage = ({ userUid }) => {
  const firestore = firebase.firestore();

  // State variable for group ID
  const [groupId, setGroupId] = useState(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/groups' />
          </IonButtons>
          <IonTitle>Create Group</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* GroupCreationForm sets the group ID once created */}
        <GroupCreationForm
          //   userUid={userUid}
          firestore={firestore}
          setGroupId={setGroupId}
        />
        {/* AddMemberForm uses the group ID to add members */}
        {/* <AddMemberForm groupId={groupId} firestore={firestore} /> */}
      </IonContent>
    </IonPage>
  );
};

export default GroupCreationPage;
