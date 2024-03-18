import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonText,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { people, add } from 'ionicons/icons';
import { fetchMembersData } from '../functions/GroupsHelper';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState([]);
  const currentUserId = firebase.auth().currentUser?.uid;
  // console.log('currentUserId', currentUserId);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const history = useHistory();

  const handleCreateGroup = () => {
    history.push('/my/groupcreation');
  };
  const handleInsideGroup = (groupId: string) => {
    history.push({
      pathname: `/my/insideGroups/${groupId}`,
      state: { groupId: groupId },
    });
  };

  useEffect(() => {
    const fetchGroups = async () => {
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
    fetchGroups();
  }, [groups]);

  useEffect(() => {
    if (groups.length > 0) {
      fetchMembersData(groups[0], setMembersData);
    } else {
      return;
    }
  }, [currentUserId]);

  if (groups.length === 0 && !loading) {
    console.log('Redirecting to /my/groupcreation');
    return <Redirect to='/my/groupcreation' />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Groups</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRow>
          <IonLabel className='ion-padding'>
            Welcome to the Groups Page
          </IonLabel>
        </IonRow>
        <IonRow>
          {groups.map((group, index) => (
            <IonCol size='6' key={index}>
              <IonCard>
                <IonCardHeader>
                  <IonButton
                    fill='clear'
                    routerLink={`/my/insideGroupsTwo/${group.id}`}
                    routerDirection='forward'
                    onClick={() => console.log('Button clicked')}
                  >
                    <div
                      style={{
                        flexDirection: 'column',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <IonText
                        style={{
                          textAlign: 'center',
                          width: '100%',
                          fontSize: 'larger',
                        }}
                      >
                        <IonCardTitle className='small-font-groups'>
                          {group.name}
                        </IonCardTitle>
                      </IonText>
                      <IonText style={{ textAlign: 'center', width: '100%' }}>
                        <IonCardSubtitle className='small-font'>
                          <IonIcon icon={people} />
                          {group.members.length}
                        </IonCardSubtitle>
                      </IonText>
                    </div>
                  </IonButton>
                </IonCardHeader>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
        <IonGrid>
          <IonRow></IonRow>
        </IonGrid>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton onClick={handleCreateGroup}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
