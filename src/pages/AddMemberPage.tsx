import { useState } from 'react';
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

const AddMemberPage = ({ userUid }) => {
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
          <IonTitle>Add a Member</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <AddMemberForm groupId={groupId} firestore={firestore} />
      </IonContent>
    </IonPage>
  );
};

export default AddMemberPage;
