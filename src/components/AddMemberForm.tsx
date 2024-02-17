import React, { useState } from 'react';
import firebase from 'firebase/app';

type AddMemberFormProps = {
  groupId: string;
  firestore: any;
};

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  groupId,
  firestore,
}) => {
  const [email, setEmail] = useState('');
  const [groupMembers, setGroupMembers] = useState([]); // [userId, userId, ...
  console.log(firebase.auth().currentUser);
  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    // Check if groupId is a non-empty string
    if (!groupId) {
      console.log('groupId is not a non-empty string');
      return;
    }
    const userRef = await firestore
      .collection('publicUsers')
      .where('email', '==', email)
      .get();
    const user = userRef.docs[0];

    if (user) {
      const userId = user.id;
      await firestore
        .collection('groups')
        .doc(groupId)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion(userId),
        });
    }
  };

  return (
    <form onSubmit={addMember}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type='submit'>Add Member</button>
    </form>
  );
};
export default AddMemberForm;
