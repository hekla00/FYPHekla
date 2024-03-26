import React, { useState, useEffect } from 'react';
import {
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonContent,
  IonPage,
  IonListHeader,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { trashBin } from 'ionicons/icons';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { useAuth } from '../authentication';
import UserSearchAndAdd from './UserSearchAndAdd';
import { useHistory } from 'react-router-dom';

interface GroupCreationFormProps {
  firestore: firebase.firestore.Firestore;
  setGroupId: (id: string) => void;
}

const GroupCreationForm: React.FC<GroupCreationFormProps> = ({
  firestore,
  setGroupId,
}) => {
  // const auth = useAuth().userID;
  const userUid = useAuth().userID;
  // const auth = useAuth();
  // const currentUser = firebase.auth().currentUser;
  const [groupName, setGroupName] = useState('');
  const [userIds, setUserIds] = useState(userUid ? [userUid] : []);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState('');
  const currentUserId = firebase.auth().currentUser?.uid;
  // console.log('emails:', emails);
  // console.log('auth group:', auth);
  // console.log('Current user ID:', currentUser?.uid);
  // const createGroup = async () => {
  //   setIsLoading(true);
  //   try {
  //     const groupRef = await firestore.collection('groups').add({
  //       groupName: groupName,
  //       members: userIds.filter(Boolean),
  //     });
  //     await groupRef.update({ groupId: groupRef.id });
  //     setGroupId(groupRef.id);
  //     setMessage('Group created successfully!');
  //     setToastColor('success');
  //     setShowToast(true);
  //     history.push('/my/groups');
  //   } catch (error) {
  //     console.error('Error creating group:', error);
  //     setMessage('Error creating group. Please try again.');
  //     setToastColor('danger');
  //     setShowToast(true);
  //   }
  //   setIsLoading(false);
  // };
  const createGroup = async () => {
    console.log('createGroup function called');
    setIsLoading(true);
    const uniqueUserIds = userIds.includes(currentUserId)
      ? userIds
      : [...userIds, currentUserId];
    try {
      const groupRef = await firestore.collection('groups').add({
        name: groupName,
        members: userIds.filter(Boolean),
      });

      await groupRef.update({ groupId: groupRef.id });

      setGroupId(groupRef.id);
      setMessage('Group created successfully');
      setToastColor('success');
      setShowToast(true);
      console.log('Navigating to /my/groups');
      history.push('/my/groups');
    } catch (error) {
      console.error('Error creating group: ', error);
      setMessage('Error creating group');
      setToastColor('danger');
      setShowToast(true);
    }
    setIsLoading(false);
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

  const onUserRemove = (userIdToRemove) => {
    const newUserIds = userIds.filter((userId) => userId !== userIdToRemove);
    setUserIds(newUserIds);

    setEmails((prevEmails) =>
      prevEmails.filter((email, index) => newUserIds.includes(userIds[index]))
    );
  };

  return (
    <IonPage>
      <IonContent>
        <form>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel>
                    <h2>Group Name</h2>
                  </IonLabel>
                  <IonInput
                    // label='Group Name'
                    // labelPlacement='floating'
                    value={groupName}
                    onIonChange={(e) => setGroupName(e.target.value.toString())}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {emails.length > 0 && (
                  <>
                    <IonListHeader>
                      <IonLabel>
                        <h2>Group Members</h2>
                      </IonLabel>
                    </IonListHeader>
                    <IonList>
                      {emails.map((email, index) => (
                        <IonItem key={index}>
                          <IonLabel>{email}</IonLabel>
                          <IonButton
                            color='danger'
                            onClick={() => {
                              onUserRemove(userIds[index]);
                            }}
                          >
                            <IonIcon icon={trashBin} />
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  </>
                )}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <UserSearchAndAdd
                  onUserAdd={(userId, userEmail) => {
                    setUserIds((prevUserIds) => [...prevUserIds, userId]);
                    setEmails((prevEmails) => [...prevEmails, userEmail]);
                  }}
                />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton
                  expand='block'
                  onClick={createGroup}
                  // disabled={isLoading}
                >
                  {/* {isLoading ? 'Creating Group...' : 'Create Group'} */}
                  Create Group
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={message}
            duration={2000}
            color={toastColor}
          />
        </form>
      </IonContent>
    </IonPage>
  );
};

export default GroupCreationForm;
