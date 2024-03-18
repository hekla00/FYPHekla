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
  IonListHeader,
  IonAvatar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import LeaveGroup from '../components/LeaveGroup';
import { useLocation, useParams } from 'react-router-dom';

import { chevronUpCircle, personAdd } from 'ionicons/icons';

const InsideGroupsPage: React.FC = () => {
  const [group, setGroup] = useState<any | null>(null);
  const currentUserId = firebase.auth().currentUser?.uid;
  // console.log('currentUserId', currentUserId);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const history = useHistory();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();
  // const groupID = location.state?.groupId;
  const { id } = useParams<{ id: string }>();

  const handleAddMemberClick = () => {
    history.push('/my/addmember');
  };

  //   useEffect(() => {
  //     const fetchGroups = async () => {
  //       const db = firebase.firestore();
  //       console.log('currentUserId', currentUserId);
  //       db.collection('groups')
  //         .where('members', 'array-contains', currentUserId)
  //         .get()
  //         .then((snapshot) => {
  //           const groups = snapshot.docs.map((doc) => ({
  //             id: doc.id,
  //             ...doc.data(),
  //           }));
  //           console.log('groups', groups);
  //           setGroups(groups);
  //           console.log('groups after', groups);
  //           setLoading(false);
  //         })
  //         .catch((error) => {
  //           console.error('Error fetching groups:', error);
  //         });
  //     };

  //     fetchGroups();
  //   }, [currentUserId]);

  //   useEffect(() => {
  //     const fetchMembersData = async () => {
  //       const db = firebase.firestore();

  //       // Fetch user data for each member
  //       const membersDataPromises = group[0].members.map((memberId) =>
  //         db.collection('publicUsers').doc(memberId).get()
  //       );
  //       const membersSnapshots = await Promise.all(membersDataPromises);

  //       // Map over the snapshots to get the user data
  //       const membersData = membersSnapshots.map((snapshot) => ({
  //         id: snapshot.id,
  //         ...snapshot.data(),
  //       }));

  //       setMembersData(membersData);
  //     };

  //     // Only fetch member data if the groups have been loaded
  //     if (group.length > 0) {
  //       fetchMembersData();
  //     }
  //   }, [group]);

  //   if (groups.length === 0 && !loading) {
  //     console.log('Redirecting to /my/groupcreation');
  //     return <Redirect to='/my/groupcreation' />;
  //   }
  useEffect(() => {
    const fetchGroup = async () => {
      const db = firebase.firestore();
      const doc = await db.collection('groups').doc(id).get();
      if (doc.exists) {
        setGroup({ id: doc.id, ...doc.data() });
      } else {
        console.error('No such group!');
      }
    };
    fetchGroup();
  }, [id]);
  useEffect(() => {
    const fetchMembersData = async () => {
      if (!group) {
        return;
      }

      const db = firebase.firestore();

      // Fetch user data for each member
      const membersDataPromises = group.members.map((memberId) =>
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

    // Only fetch member data if the group has been loaded
    if (group) {
      fetchMembersData();
    }
  }, [group]);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!group) {
    return <div>No group selected</div>;
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{group ? group.name : 'Loading...'}</IonTitle>
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
            <IonCol>
              <IonListHeader>
                <IonLabel>Members</IonLabel>
              </IonListHeader>
              <IonList lines='full'>
                {/* Display the members */}
                {membersData.map((member, index) => (
                  <IonItem key={index}>
                    <IonAvatar slot='start'>
                      <img src={member.profile || '/placeholder1.jpg'} />
                    </IonAvatar>
                    <IonLabel>{member.email}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            {/* <IonFabButton>
                <IonIcon icon={settings}></IonIcon>
              </IonFabButton> */}
            <IonFabButton onClick={handleAddMemberClick}>
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <LeaveGroup groupId={group.id} />
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default InsideGroupsPage;
