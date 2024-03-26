import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
// import { useParams } from 'react-router-dom';

interface RouteParams {
  groupId: string;
}

const AddMemberPage = () => {
  const { groupId } = useParams<RouteParams>();
  const firestore = firebase.firestore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      const groupSnapshot = await firestore
        .collection('groups')
        .doc(groupId)
        .get();

      if (groupSnapshot.exists) {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [firestore, groupId]);

  if (loading) {
    return <div>Loading...</div>;
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
        <AddMemberForm groupId={groupId} firestore={firestore} />
      </IonContent>
    </IonPage>
  );
};

export default AddMemberPage;
