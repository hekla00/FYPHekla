import {
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
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonText,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useHistory, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import LeaveGroup from '../components/LeaveGroup';

import { chevronUpCircle, personAdd, addCircle, people } from 'ionicons/icons';
import {
  fetchMembersData,
  fetchGroupCurrentUser,
} from '../functions/GroupsHelper';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState([]);
  const currentUserId = firebase.auth().currentUser?.uid;
  // console.log('currentUserId', currentUserId);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const history = useHistory();
  const [shouldRedirect, setShouldRedirect] = useState(false);

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
    const fetchMembersData = async () => {
      const db = firebase.firestore();

      // Fetch user data for each member
      const membersDataPromises = groups[0].members.map((memberId) =>
        db.collection('publicUsers').doc(memberId).get()
      );
      const membersSnapshots = await Promise.all(membersDataPromises);

      // Map over the snapshots to get the user data
      const membersData = membersSnapshots.map((snapshot) => ({
        id: snapshot.id,
        ...snapshot.data(),
      }));

      setMembersData(membersData);
    };

    // Only fetch member data if the groups have been loaded
    if (groups.length > 0) {
      fetchMembersData();
    }
    // fetchGroupCurrentUser(setGroups, setLoading);
    // if (groups.length > 0) {
    //   fetchMembersData(groups, setMembersData);
    // }
  }, [currentUserId, groups]);

  // useEffect(() => {
  //   const fetchMembersData = async () => {
  //     const db = firebase.firestore();

  //     // Fetch user data for each member
  //     const membersDataPromises = groups[0].members.map((memberId) =>
  //       db.collection('publicUsers').doc(memberId).get()
  //     );
  //     const membersSnapshots = await Promise.all(membersDataPromises);

  //     // Map over the snapshots to get the user data
  //     const membersData = membersSnapshots.map((snapshot) => ({
  //       id: snapshot.id,
  //       ...snapshot.data(),
  //     }));

  //     setMembersData(membersData);
  //   };

  //   // Only fetch member data if the groups have been loaded
  //   if (groups.length > 0) {
  //     fetchMembersData();
  //   }
  // }, [groups]);

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
                  {/* <Link
                    to={{
                      pathname: `/my/insideGroups/${group.id}`,
                      state: { group: group },
                    }}
                    onClick={() => console.log('Link clicked')}
                  > */}
                  <IonButton
                    fill='clear'
                    routerLink={`/my/insideGroupsTwo/${group.id}`}
                    routerDirection='forward'
                    onClick={() => console.log('Button clicked')}
                    // routerLink={`/my/insideGroups/${group.id}`}
                    // onClick={() => handleInsideGroup(group.id)}
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
                        <IonCardTitle className='small-font'>
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
                  {/* </Link> */}
                </IonCardHeader>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
        <IonGrid>
          <IonRow>
            {/* <IonLabel className='ion-padding'>
              <h1>My Groups</h1>
            </IonLabel> */}
          </IonRow>
        </IonGrid>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton onClick={handleCreateGroup}>
            <IonIcon icon={addCircle}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
