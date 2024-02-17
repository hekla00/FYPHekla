import React, { useState } from 'react';
import {
  IonInput,
  IonButton,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { useAuth } from '../authentication';

interface AddMemberFormProps {
  firestore: firebase.firestore.Firestore;
  groupId: string;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  firestore,
  groupId,
}) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emails, setEmails] = useState([]);
  const currentUser = firebase.auth().currentUser;
  // console.log('Current user ID:', currentUser?.uid);
  const addUser = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log(newUserEmail);
    try {
      const userSnapshot = await firestore
        .collection('publicUsers')
        .where('email', '==', newUserEmail)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        // Add the new user to the group in Firestore
        await firestore
          .collection('groups')
          .doc(groupId)
          .update({
            members: firebase.firestore.FieldValue.arrayUnion(userId),
          });
        setSuccessMessage(
          `User with email ${newUserEmail} was successfully added to the group.`
        );
        setErrorMessage('');
      } else {
        setErrorMessage(`No user found with email: ${newUserEmail}`);
      }
    } catch (error) {
      setErrorMessage(`Error adding user to group: ${error.message}`);
    }

    // setNewUserEmail(''); // Clear the new user email input field
  };

  return (
    <form onSubmit={addUser}>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonInput
                label='Add User Email'
                labelPlacement='floating'
                value={newUserEmail}
                onIonChange={(e) => setNewUserEmail(e.detail.value || '')}
              />
            </IonItem>
            <IonButton expand='full' type='submit'>
              Add User
            </IonButton>
            {successMessage && (
              <IonText color='success'>{successMessage}</IonText>
            )}{' '}
            {errorMessage && <IonText color='danger'>{errorMessage}</IonText>}
          </IonCol>
        </IonRow>
      </IonGrid>
    </form>
  );
};

export default AddMemberForm;
