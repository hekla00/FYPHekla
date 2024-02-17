import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonList,
  IonItem,
  IonContent,
} from '@ionic/react';
import { Redirect } from 'react-router';

import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState([]);

  const userId = firebase.auth().currentUser?.uid;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const db = firebase.firestore();
      const snapshot = await db
        .collection('groups')
        .where('members', 'array-contains', userId)
        .get();

      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groups);
      setLoading(false);
    };

    fetchGroups();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>; // or return a loading spinner
  }

  if (groups.length === 0) {
    return <Redirect to='/my/groupcreation' />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Groups</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonLabel className='ion-padding'>
              Welcome to the Groups Page
            </IonLabel>
          </IonRow>
          <IonRow>
            <IonCol size='6'>
              <IonCard>
                <IonCardHeader>
                  <IonButton fill='clear' routerLink='/my/books/add'>
                    <IonCardTitle className='small-font'>
                      Join a Group
                    </IonCardTitle>
                  </IonButton>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard>
                <IonCardHeader>
                  <IonButton fill='clear' routerLink='/my/groupcreation'>
                    <IonCardTitle className='small-font'>
                      Create a Group
                    </IonCardTitle>
                  </IonButton>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='12'>
              <IonCard>
                <IonCardHeader>
                  <IonButton fill='clear' routerLink='/my/addmember'>
                    <IonCardTitle className='small-font'>
                      Add a Member to a Group
                    </IonCardTitle>
                  </IonButton>
                </IonCardHeader>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonTitle>Your Groups</IonTitle>
            </IonCol>
          </IonRow>
          <IonList lines='full'>
            {groups.map((item, index) => (
              <IonItem key={index}>
                <IonLabel>{item.groupName}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
