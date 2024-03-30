import React, { useState, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonToast } from '@ionic/react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import UserSearchAndAdd from './UserSearchAndAdd';

interface AddMemberFormProps {
  firestore: firebase.firestore.Firestore;
  groupId: string;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  firestore,
  groupId,
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const currentUserId = firebase.auth().currentUser?.uid;

  useEffect(() => {
    const fetchGroupMembers = async () => {
      const groupSnapshot = await firestore
        .collection('groups')
        .doc(groupId)
        .get();
      const groupData = groupSnapshot.data();
      if (groupData && groupData.members) {
        setMembers(groupData.members);
      }
    };

    fetchGroupMembers();
  }, [firestore, groupId]);

  const onUserRemove = async (userId) => {
    setIsAdding(true);
    try {
      // Remove the user from the group in Firestore
      await firestore
        .collection('groups')
        .doc(groupId)
        .update({
          members: firebase.firestore.FieldValue.arrayRemove(userId),
        });
      setSuccessMessage(`User was successfully removed from the group.`);
      setErrorMessage('');
    } catch (error) {
      console.error('Error removing user from group:', error);
      setErrorMessage(`Error removing user from group: ${error.message}`);
    }
    setIsAdding(false);
  };
  return (
    <form>
      <IonGrid>
        <IonRow>
          <IonCol>
            {showSearchResults && (
              <UserSearchAndAdd
                onUserAdd={async (userId, userEmail) => {
                  setIsAdding(true);
                  try {
                    // Fetch the group data from Firestore
                    const groupSnapshot = await firestore
                      .collection('groups')
                      .doc(groupId)
                      .get();
                    const groupData = groupSnapshot.data();

                    // Check if the user is already a member of the group
                    if (groupData && groupData.members.includes(userId)) {
                      // The user is already a member of the group, so set an error message
                      setErrorMessage(
                        `User with email ${userEmail} is already a member of the group.`
                      );
                    } else {
                      // The user is not a member of the group, so add them
                      await firestore
                        .collection('groups')
                        .doc(groupId)
                        .update({
                          members:
                            firebase.firestore.FieldValue.arrayUnion(userId),
                        });
                      setSuccessMessage(
                        `User with email ${userEmail} was successfully added to the group.`
                      );
                      setErrorMessage('');
                    }
                  } catch (error) {
                    console.error('Error adding user to group:', error);
                    setErrorMessage(
                      `Error adding user to group: ${error.message}`
                    );
                  }
                  setIsAdding(false);
                }}
                currentUserId={currentUserId}
              />
            )}
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonToast
        isOpen={!!successMessage}
        onDidDismiss={() => setSuccessMessage('')}
        message={successMessage}
        duration={2000}
        color='success'
      />
      <IonToast
        isOpen={!!errorMessage}
        onDidDismiss={() => setErrorMessage('')}
        message={errorMessage}
        duration={2000}
        color='danger'
      />
    </form>
  );
};

export default AddMemberForm;
