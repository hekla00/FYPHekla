import React, { useState } from 'react';
import {
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { useAuth } from '../authentication';
import { authContext } from '../authentication';
import { add } from 'ionicons/icons';
import { useEffect } from 'react';
interface GroupCreationFormProps {
  // userUid: string;
  firestore: firebase.firestore.Firestore;
  setGroupId: (id: string) => void;
}

const GroupCreationForm: React.FC<GroupCreationFormProps> = ({
  // userUid,
  firestore,
  setGroupId,
}) => {
  // const auth = useAuth().userID;
  const userUid = useAuth().userID;
  const auth = useAuth();
  const currentUser = firebase.auth().currentUser;
  const [groupName, setGroupName] = useState('');
  const [userIds, setUserIds] = useState(userUid ? [userUid] : []); // Initialize with the current user's ID
  const [newUserEmail, setNewUserEmail] = useState('');
  const [emails, setEmails] = useState([]);
  console.log('emails:', emails);
  // console.log('auth group:', auth);
  // console.log('Current user ID:', currentUser?.uid);
  const createGroup = async () => {
    const groupRef = await firestore.collection('groups').add({
      groupName: groupName,
      members: userIds.filter(Boolean),
    });
    await groupRef.update({ groupId: groupRef.id });
    setGroupId(groupRef.id);

    // addUser();
    if (!groupName || groupName === undefined) {
      console.error('Group name is not defined');
      return;
    }
    if (!userUid) {
      console.error('User ID is not defined');
      return;
    }
  };

  const addUser = async () => {
    const userSnapshot = await firestore
      .collection('publicUsers')
      .where('email', '==', newUserEmail)
      .get();
    // console.log('newUserEmail:', newUserEmail);
    // console.log('userSnapshot:', userSnapshot);
    if (!userSnapshot.empty) {
      const userId = userSnapshot.docs[0].id;
      setUserIds((prevUserIds) => [...prevUserIds, userId]);
      setEmails((prevEmails) => [...prevEmails, newUserEmail]);
    }

    // setNewUserEmail(''); // Clear the new user email input field
  };

  useEffect(() => {
    // This code will run whenever `userIds` or `emails` changes
    console.log('User IDs:', userIds);
    console.log('Emails:', emails);
  }, [userIds, emails]);
  return (
    <form>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonInput
                label='Group Name'
                labelPlacement='floating'
                value={groupName}
                onIonChange={(e) => setGroupName(e.target.value.toString())}
              />
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonInput
                label='Add User Email'
                labelPlacement='floating'
                value={newUserEmail}
                onIonChange={(e) => setNewUserEmail(e.target.value.toString())}
              />
            </IonItem>
            <IonButton expand='full' onClick={addUser}>
              Add User
            </IonButton>
          </IonCol>
        </IonRow>
        {/* <IonRow>
          <IonCol>
            <IonList>
              {userIds.map((userId, index) => (
                <IonItem key={index}>{userId}</IonItem>
              ))}
            </IonList>
          </IonCol>
        </IonRow> */}
        <IonRow>
          <IonCol>
            <IonText>Group Members: </IonText>
            <IonList>
              {emails.map((email, index) => (
                <IonItem key={index}>{email}</IonItem>
              ))}
            </IonList>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton expand='full' onClick={createGroup}>
              Create Group
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </form>
  );
};

export default GroupCreationForm;
