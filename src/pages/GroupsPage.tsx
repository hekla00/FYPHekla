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
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { chevronUpCircle, personAdd, exit, settings } from 'ionicons/icons';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState([]);
  const userId = firebase.auth().currentUser?.uid;
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const handleAddMemberClick = () => {
    history.push('/my/addmember');
  };

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
          <IonTitle>{groups[0].groupName}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonLabel className='ion-padding'>
              Welcome to the Groups Page
            </IonLabel>
          </IonRow>
          {/* <IonList lines='full'>
            {groups.map((item, index) => (
              <IonItem key={index}>
                <IonLabel>{item.groupName}</IonLabel>
              </IonItem>
            ))}
          </IonList> */}
        </IonGrid>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            <IonFabButton>
              <IonIcon icon={settings}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={handleAddMemberClick}>
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={exit}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
