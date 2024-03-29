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
import GroupCreationForm from '../components/GroupCreationForm';
import firebase from 'firebase/app';

const GroupCreationPage = ({ userUid }) => {
  const firestore = firebase.firestore();
  const [groupId, setGroupId] = useState(null);

  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}
        <IonButtons className='button-padding' slot='start'>
          <IonBackButton defaultHref='/my/groups' />
        </IonButtons>

        {/* <IonTitle>Create Group</IonTitle> */}
        {/* </IonToolbar> */}
      </IonHeader>
      <div style={{ height: '20px' }}></div>
      <IonContent>
        <GroupCreationForm firestore={firestore} setGroupId={setGroupId} />
      </IonContent>
    </IonPage>
  );
};

export default GroupCreationPage;
