import React, { useState } from 'react';
import { IonInput, IonButton } from '@ionic/react';
import firebase from 'firebase/app';

const GroupCreationForm = ({ userUid, firestore }) => {
  const [groupName, setGroupName] = useState('');

  const createGroup = async () => {
    // Add group to Firestore
    const groupRef = await firestore.collection('groups').add({
      name: groupName,
      members: [userUid],
    });

    // Add the group to the user's document
    await firestore
      .collection('users')
      .doc(userUid)
      .update({
        groups: firebase.firestore.FieldValue.arrayUnion(groupRef.id),
      });
  };

  return (
    <form>
      <IonInput
        value={groupName}
        placeholder='Enter Group Name'
        onIonChange={(e) => setGroupName(e.detail.value)}
      />
      <IonButton onClick={createGroup}>Create Group</IonButton>
    </form>
  );
};

export default GroupCreationForm;
